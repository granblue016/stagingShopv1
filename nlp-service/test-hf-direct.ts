import "dotenv/config";
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

async function testHuggingFace() {
  console.log("=== Testing Hugging Face API Directly ===");
  
  const models = [
    "distilbert-base-uncased-finetuned-sst-2-english",
    "cardiffnlp/twitter-roberta-base-sentiment-latest",
    "nlptown/bert-base-multilingual-uncased-sentiment"
  ];

  const testText = "This is a terrible product, I hate it. It is awful and does not work at all.";

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    console.log(`\n🔄 Testing model ${i + 1}: ${model}`);
    
    try {
      console.log("📡 Trying textClassification...");
      const classificationResult = await hf.textClassification({
        model: model,
        inputs: testText
      });
      console.log("✅ textClassification SUCCESS:", classificationResult);
      break;
    } catch (error) {
      console.log("❌ textClassification failed:", (error as Error).message);
      
      try {
        console.log("📡 Trying fillMask...");
        const maskResult = await hf.fillMask({
          model: model,
          inputs: `The review "${testText.substring(0, 100)}" is </think>.`
        });
        console.log("✅ fillMask SUCCESS:", maskResult);
        break;
      } catch (maskError) {
        console.log("❌ fillMask failed:", (maskError as Error).message);
        
        try {
          console.log("📡 Trying textGeneration...");
          const genResult = await hf.textGeneration({
            model: model,
            inputs: `Analyze sentiment: ${testText.substring(0, 200)}`,
            parameters: {
              max_new_tokens: 50,
              temperature: 0.1,
              return_full_text: false
            }
          });
          console.log("✅ textGeneration SUCCESS:", genResult);
          break;
        } catch (genError) {
          console.log("❌ textGeneration failed:", (genError as Error).message);
        }
      }
    }
    
    if (i === models.length - 1) {
      console.log("\n❌ All models failed!");
    }
  }
}

testHuggingFace().catch(console.error);
