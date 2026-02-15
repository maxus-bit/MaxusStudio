const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentWritten, onDocumentCreated } = require("firebase-functions/v2/firestore");
const { GoogleAuth } = require("google-auth-library");
const { VertexAI } = require('@google-cloud/vertexai');
const admin = require('firebase-admin');

// Инициализация Stripe (ключ будет браться из переменных окружения при деплое)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_PLACEHOLDER'); 

admin.initializeApp();

const auth = new GoogleAuth({
  scopes: "https://www.googleapis.com/auth/cloud-platform",
});

// --- 0. Создание Пользователя (Триггер) ---
// При создании нового пользователя в Auth, проверяем историю и создаем документ в Firestore.
exports.onUserCreated = require("firebase-functions/v1").auth.user().onCreate(async (user) => {
    const db = admin.firestore();
    const email = user.email;
    let initialCredits = 2; // По умолчанию даем 2 кредита

    // Если есть email, проверяем, регистрировался ли он ранее
    if (email) {
        // Используем email как ID документа в специальной коллекции истории
        // Это предотвратит повторное начисление даже при удалении основного аккаунта
        const historyRef = db.collection('registration_history').doc(email);
        
        try {
            const historyDoc = await historyRef.get();
            
            if (historyDoc.exists) {
                console.log(`Email ${email} has been used before. No new free credits granted.`);
                initialCredits = 0;
            } else {
                // Записываем email в историю, чтобы запомнить факт выдачи бесплатных кредитов
                await historyRef.set({
                    firstRegisteredAt: admin.firestore.FieldValue.serverTimestamp(),
                    originalUid: user.uid
                });
            }
        } catch (historyError) {
            console.error("Error checking registration history:", historyError);
            // В случае ошибки безопаснее не давать кредиты или дать (на усмотрение), 
            // но здесь продолжим выполнение с дефолтным значением или 0, чтобы не абузили при сбоях БД.
        }
    }

    try {
        await db.collection('users').doc(user.uid).set({
            email: user.email,
            credits: initialCredits,
            subscriptionStatus: 'free',
            subscriptionPlan: 'free',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`User ${user.uid} created with ${initialCredits} credits.`);
    } catch (error) {
        console.error("Error creating user profile:", error);
    }
});

// --- 1. Генерация Изображений ---
exports.generateImage = onCall({ region: "us-central1", timeoutSeconds: 60 }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const uid = request.auth.uid;
  const db = admin.firestore();
  const userRef = db.collection('users').doc(uid);

  try {
    await db.runTransaction(async (t) => {
      const userDoc = await t.get(userRef);
      if (!userDoc.exists) {
        throw new HttpsError("not-found", "User profile not found.");
      }
      
      const userData = userDoc.data();
      const credits = userData.credits || 0;

      if (credits <= 0) {
        throw new HttpsError("resource-exhausted", "Insufficient credits. Please upgrade your plan.");
      }
    });
  } catch (e) {
    if (e.code === 'resource-exhausted' || e.code === 'not-found') throw e;
    throw new HttpsError("internal", "Failed to verify credits.");
  }

  const projectId = process.env.GCLOUD_PROJECT || "maxus-studio";
  const location = "us-central1";
  
  const prompt = request.data.prompt;
  const imageBase64 = request.data.image;
  const aspectRatio = request.data.aspectRatio || "16:9";

  if (!prompt) {
    throw new HttpsError("invalid-argument", "The function must be called with a prompt.");
  }

  let finalPrompt = prompt;
  let generatedImageBase64 = null;

  try {
    const vertexAI = new VertexAI({ project: projectId, location: location });
    
    // UPDATED: Using Gemini 2.0 Flash 001
    const generativeModel = vertexAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

    // ОБНОВЛЕННАЯ ЛОГИКА ПРОМПТ-ИНЖИНИРИНГА (BETTER TEXT RENDERING)
    
    const SYSTEM_INSTRUCTION = `
    You are an expert Visual Prompt Engineer for Imagen 3.
    
    YOUR GOAL:
    Transform the user's raw input into a detailed, professional image generation prompt.
    
    KEY CAPABILITIES:
    1. **Style Adaptation:** 
       - If the user specifies a style (Anime, Realistic, 3D, Oil Painting), USE IT.
       - If no style is specified, default to "High-quality, professional photography, 4k, detailed".
       
    2. **TEXT RENDERING (CRITICAL - READ CAREFULLY):**
       - The user wants TEXT on the image. This is the hardest part.
       - **DETECT:** If user asks for text (e.g. "saying HELLO", "text: SALE").
       - **STRATEGY:**
         - Keep text SHORT (1-3 words max). Long sentences fail.
         - Use explicit typography keywords: "bold typography", "poster design", "clear font".
         - Isolate the text in the prompt.
       - **MANDATORY FORMAT:**
         "... featuring the text 'YOUR_TEXT' written in large, legible, [color] [style] font in the [position] ..."
       - **EXAMPLE:**
         User: "Thumbnail with text GAMING"
         -> Output: "Energetic youtube thumbnail, neon cyber background, excited gamer, featuring the word 'GAMING' written in massive, bold, glowing white 3D letters in the center, professional typography, correct spelling, 8k resolution."
    
    3. **Composition:**
       - Ensure the text has clear space (negative space) so it's readable. Do not clutter the background behind the text.

    4. **Safety:**
       - Sanitize offensive requests into safe visual descriptions. Do not refuse.

    USER RAW INPUT: "${prompt}"

    ACTION:
    Write the final, optimized English prompt. Focus on making the text legible and correctly spelled.
    
    OUTPUT ONLY THE RAW ENGLISH PROMPT.
    `;

    if (imageBase64) {
      // IMAGE TO IMAGE MODE
      const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
      const imagePart = { inlineData: { data: cleanBase64, mimeType: 'image/png' } };
      const textPart = {
        text: `
        Analyze this image and the user's instruction.
        
        USER INSTRUCTION: "${prompt}"
        
        Task: Write a new prompt for Imagen 3 that modifies the image.
        - If the user wants text, ensure it is described as "bold, clear text 'TEXT' ...".
        - Maintain the original style unless asked to change.
        
        Output ONLY the prompt in English.
        `
      };

      const result = await generativeModel.generateContent({
        contents: [{ role: 'user', parts: [imagePart, textPart] }],
      });
      const response = await result.response;
      finalPrompt = response.candidates[0].content.parts[0].text;
      
    } else {
      // TEXT TO IMAGE MODE
      const textPart = { text: SYSTEM_INSTRUCTION };
      
      const result = await generativeModel.generateContent({
        contents: [{ role: 'user', parts: [textPart] }],
      });
      const response = await result.response;
      finalPrompt = response.candidates[0].content.parts[0].text;
    }

    console.log("Original Prompt:", prompt);
    console.log("Optimized Prompt:", finalPrompt);

    if (!finalPrompt) {
        throw new Error("Gemini returned empty prompt.");
    }

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    const modelId = "imagen-3.0-generate-001";
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:predict`;

    const requestBody = {
      instances: [{ prompt: finalPrompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: aspectRatio,
        outputOptions: { mimeType: "image/png" },
        safetySetting: "block_only_high",
        personGeneration: "allow_adult",
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Vertex AI API Error Body:", errorText);
        
        let errorMessage = `Vertex AI API Error: ${response.status} ${response.statusText}`;
        try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error && errorJson.error.message) {
                errorMessage = errorJson.error.message;
            }
        } catch(e) {}
        
        throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data.predictions && data.predictions.length > 0) {
      generatedImageBase64 = data.predictions[0].bytesBase64Encoded;
    } else {
        console.error("No predictions in response:", JSON.stringify(data));
        throw new Error("No image generated by AI model. Likely safety filter.");
    }

  } catch (error) {
    console.error("Error generating image:", error);
    throw new HttpsError("internal", error.message || "Internal error during generation.");
  }

  try {
      await db.runTransaction(async (t) => {
        const userDoc = await t.get(userRef);
        if (userDoc.exists) {
            const currentCredits = userDoc.data().credits || 0;
            if (currentCredits > 0) {
                t.update(userRef, { credits: currentCredits - 1 });
            }
        }
      });
  } catch (deductError) {
      console.error("Failed to deduct credit:", deductError);
  }

  return { image: generatedImageBase64 };
});

// --- 2. Создание сессии Портала (Billing) ---
exports.createPortalSession = onCall({ region: "us-central1" }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in');
    }

    const uid = request.auth.uid;
    const db = admin.firestore();

    const customerSnapshot = await db.collection('customers').doc(uid).get();
    
    // Safety check: ensure customer exists
    if (!customerSnapshot.exists) {
         throw new HttpsError('failed-precondition', 'Customer record not found');
    }

    const stripeCustomerId = customerSnapshot.data().stripeId;

    if (!stripeCustomerId) {
        throw new HttpsError('failed-precondition', 'No payment method attached');
    }

    try {
        const session = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: request.data.returnUrl || 'https://maxus-studio.web.app/dashboard'
        });
        return { url: session.url };
    } catch (error) {
        console.error("Stripe Portal Error:", error);
        throw new HttpsError('internal', 'Unable to create portal session');
    }
});

// --- 3. Синхронизация Подписки (Webhook Handler) ---
exports.onSubscriptionUpdate = onDocumentWritten("customers/{uid}/subscriptions/{subId}", async (event) => {
    const snapshot = event.data.after;
    const uid = event.params.uid;
    const db = admin.firestore();

    if (!snapshot.exists) {
        await db.collection('users').doc(uid).update({
            subscriptionStatus: 'free',
            subscriptionPlan: 'free'
        });
        return;
    }

    const subData = snapshot.data();
    const status = subData.status;
    const items = subData.items || [];
    const priceId = items.length > 0 ? items[0].price.id : null;

    // --- КОНФИГУРАЦИЯ ТВОИХ ЦЕН ---
    const PLANS = {
        // Месячные
        'price_1SsKj73OhZaczFnLGEiyalX1': { name: 'basic', credits: 80 },
        'price_1SsKjZ3OhZaczFnLrPztPsTY': { name: 'pro', credits: 200 },
        'price_1SsKjt3OhZaczFnLnlGe0mii': { name: 'ultra', credits: 1000 },
        
        // Годовые (x12 кредитов)
        'price_1SsKus3OhZaczFnLXHzLQUfE': { name: 'basic', credits: 960 },
        'price_1SsKvM3OhZaczFnLEyjOznE9': { name: 'pro', credits: 2400 },
        'price_1SsKwM3OhZaczFnLXsqzHNmO': { name: 'ultra', credits: 12000 }
    };

    let planName = 'free';
    let newCredits = 0;
    let shouldUpdateCredits = false;

    if (['active', 'trialing'].includes(status)) {
        const planInfo = PLANS[priceId];
        if (planInfo) {
            planName = planInfo.name;
            newCredits = planInfo.credits;
            shouldUpdateCredits = true;
        } else {
             console.warn(`Unknown priceId: ${priceId} for user ${uid}`);
             // Фолбэк оставляем, но лучше логировать
             planName = 'pro'; 
             newCredits = 200;
             shouldUpdateCredits = true;
        }
    } else {
        planName = 'free';
    }

    const updateData = {
        subscriptionStatus: status,
        subscriptionPlan: planName,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (shouldUpdateCredits) {
        updateData.credits = newCredits;
    }

    await db.collection('users').doc(uid).set(updateData, { merge: true });
    console.log(`Updated user ${uid} subscription to ${status} (${planName})`);
});
