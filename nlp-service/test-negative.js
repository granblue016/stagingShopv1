const axios = require('axios');

async function testNegativeSentiment() {
  try {
    const response = await axios.post('http://localhost:3001/analyze', {
      reviewText: 'This product is a total disaster'
    });
    
    console.log('Test Result:', JSON.stringify(response.data, null, 2));
    
    // Check if the result meets the requirements
    if (response.data.sentiment === 'Negative' && response.data.rating_score === 1) {
      console.log('✅ SUCCESS: Negative sentiment detected correctly!');
      console.log('✅ SUCCESS: Rating score is 1 as expected!');
    } else {
      console.log('❌ FAILURE: Expected sentiment=Negative and rating_score=1');
      console.log(`   Got: sentiment=${response.data.sentiment}, rating_score=${response.data.rating_score}`);
    }
    
    // Check if justification contains Hugging Face info
    if (response.data.justification.includes('Hugging Face') || response.data.justification.includes('distilbert')) {
      console.log('✅ SUCCESS: Justification contains Hugging Face model info!');
    } else {
      console.log('❌ FAILURE: Justification should contain Hugging Face or distilbert info');
      console.log(`   Current justification: ${response.data.justification}`);
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testNegativeSentiment();
