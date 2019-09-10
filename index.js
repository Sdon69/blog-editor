const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const crypto = require('crypto');
const cookie = require('cookie');
const nonce = require('nonce')();
const querystring = require('querystring');
const request = require('request-promise');

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const scopes = 'read_products,read_themes, write_themes,read_content, write_content';
const forwardingAddress = "https://nameless-hollows-55097.herokuapp.com"; // Replace this with your HTTPS Forwarding address
// const forwardingAddress = "https://26fcb803.ngrok.io";
const fs = require('fs');

const port = process.env.PORT || 3000;


app.get('/', (req, res) => {
	
   fs.readFile('./public/test.html', null, function(error, data)
	{
		if(error)
		{	
		res.writeHead(404);
		res.write('File Not Found')
		}	else
		{
			res.write(data);
		}
		 res.end('');
	});
});


app.get('/form2', function (req, res) {
  
		 res.end(form2Html);

})

app.get('/form2.html', function (req, res) {
res.end(form2Html);
})

app.get('/shopify/form2.html', function (req, res) {
 res.end(form2Html);
})

app.post('/save', function (req, res) {
	 
	 
	 req.on('data', function(chunk) {
		   const formdata = chunk.toString();
		 let textBox = formdata.split("&")[0].substr(2);
		
		  calc(textBox,res);
		  
		 
    });
  
})


app.listen(port, () => {
  console.log('Example app listening on port' + port);

  });
  


app.get('/shopify', (req, res) => {
	
  const shop = req.query.shop;
  if (shop) {
	  
    const state = nonce();
	
    const redirectUri = forwardingAddress + '/shopify/callback';
    const installUrl = 'https://' + shop +
      '/admin/oauth/authorize?client_id=' + apiKey +
      '&scope=' + scopes +
      '&state=' + state +
      '&redirect_uri=' + redirectUri;

    res.cookie('state', state);
    res.redirect(installUrl);
  } else {
    return res.status(400).send('Missing shop parameter. Please add ?shop=your-development-shop.myshopify.com to your request');
  }
});
app.get('/shopify/callback', (req, res) => {
	console.log("ins1");
  const { shop, hmac, code, state } = req.query;
  const stateCookie = cookie.parse(req.headers.cookie).state;

  if (state !== stateCookie) {
    return res.status(403).send('Request origin cannot be verified');
  }
  
  

  if (shop && hmac && code) {
	  console.log("ins2");
    // DONE: Validate request is from Shopify
    const map = Object.assign({}, req.query);
    delete map['signature'];
    delete map['hmac'];
    const message = querystring.stringify(map);
    const providedHmac = Buffer.from(hmac, 'utf-8');
    const generatedHash = Buffer.from(
      crypto
        .createHmac('sha256', apiSecret)
        .update(message)
        .digest('hex'),
        'utf-8'
      );
    let hashEquals = false;

    try {
      hashEquals = crypto.timingSafeEqual(generatedHash, providedHmac)
    } catch (e) {
      hashEquals = false;
    };

    if (!hashEquals) {
      return res.status(400).send('HMAC validation failed');
    }

    // DONE: Exchange temporary code for a permanent access token
    const accessTokenRequestUrl = 'https://' + shop + '/admin/oauth/access_token';
    const accessTokenPayload = {
      client_id: apiKey,
      client_secret: apiSecret,
      code,
    };

	
	
	
	
	

    request.post(accessTokenRequestUrl, { json: accessTokenPayload })
    .then((accessTokenResponse) => {
      const accessToken = accessTokenResponse.access_token;
      // DONE: Use access token to make API call to 'shop' endpoint
	  
	  const text = '{"asset":[' +
'{"firstName":"John","lastName":"Doe" },' +
'{"firstName":"Anna","lastName":"Smith" },' +
'{"firstName":"Peter","lastName":"Jones" }]}';


         const shopRequestUrl = 'https://' + shop + '/admin/api/2019-07/recurring_application_charges.json?recurring_application_charge[name]=Easy Blog Creator&recurring_application_charge[price]=0.99&recurring_application_charge[return_url]='+forwardingAddress +'&recurring_application_charge[trial_days]=14';
		 const shopRequestUrl2 = 'https://' + shop + '/admin/api/2019-04/themes/41456828451/asset.json?asset[key]=assets/getAsin8.txt';
		 const shopRequestUrl3 = 'https://' + shop + '/admin/api/2019-07/recurring_application_charges.json';
	     const shopRequestUrl4 = 'https://' + shop + '/admin/api/2019-04/themes/41456828451/assets.json?asset[key]=assets/getAsin8.txt&theme_id=41456828451&fields=public_url';
    
      const shopRequestHeaders = {
		   'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
		  
      };
	  const putContent = {
		  'Content-Type': 'application/json',
              'key': "assets/getAsin.txt",
           }

   
	  request.get(shopRequestUrl3, { headers: shopRequestHeaders })
     .then((shopResponse) => {
    
	appInstalled = "";
	    shopResponseObj = JSON.parse(shopResponse);
	
	
		if(shopResponse.includes("accepted"))
		{
			res.redirect(forwardingAddress);
			
			 console.log(appInstalled);
			fs.readFile('./public/test.html', null, function(error, data)
	  {
		  if(error)
		  {	
		
		  res.write('File Not Found')
		  }	else
		  {
			
			   
			   res.end(data);
			   
			
		  }
		 
	  });
		}
		else
		{
			
			console.log(shop);
			const saveRedirectUri = forwardingAddress + "/shopify-request?shop="+shop;
			res.redirect(saveRedirectUri);
		}
		
	
	
	
	  })
      })
	  
	   } else {
    res.status(400).send('Required parameters missing');
  }
});


	  
	  app.get('/shopify-request', (req, res) => {
  	console.log("shopify-request initiated");

const shop = req.query.shop;
  if (shop) {
	  
    const state = nonce();
	console.log(forwardingAddress);
    const redirectUri = forwardingAddress + '/shopify/callback-request';
    const installUrl = 'https://' + shop +
      '/admin/oauth/authorize?client_id=' + apiKey +
      '&scope=' + scopes +
      '&state=' + state +
      '&redirect_uri=' + redirectUri;

    res.cookie('state', state);
    res.redirect(installUrl);
  } else {
    return res.status(400).send('Missing shop parameter. Please add ?shop=your-development-shop.myshopify.com to your request');
  }
});

app.get('/shopify/callback-request', (req, res) => {
	console.log("callback-request-initiated");
	
 
  const { shop, hmac, code, state } = req.query;
  const stateCookie = cookie.parse(req.headers.cookie).state;

  if (state !== stateCookie) {
    return res.status(403).send('Request origin cannot be verified');
  }

  if (shop && hmac && code) {
    // DONE: Validate request is from Shopify
    const map = Object.assign({}, req.query);
    delete map['signature'];
    delete map['hmac'];
    const message = querystring.stringify(map);
    const providedHmac = Buffer.from(hmac, 'utf-8');
    const generatedHash = Buffer.from(
      crypto
        .createHmac('sha256', apiSecret)
        .update(message)
        .digest('hex'),
        'utf-8'
      );
    let hashEquals = false;

    try {
      hashEquals = crypto.timingSafeEqual(generatedHash, providedHmac)
    } catch (e) {
      hashEquals = false;
    };

    if (!hashEquals) {
      return res.status(400).send('HMAC validation failed');
    }

    // DONE: Exchange temporary code for a permanent access token
    const accessTokenRequestUrl = 'https://' + shop + '/admin/oauth/access_token';
    const accessTokenPayload = {
      client_id: apiKey,
      client_secret: apiSecret,
      code,
    };
	
	

    request.post(accessTokenRequestUrl, { json: accessTokenPayload })
    .then((accessTokenResponse) => {
		
	
		
		
      const accessToken = accessTokenResponse.access_token;
      // DONE: Use access token to make API call to 'shop' endpoint
	
   
	  
      const shopRequestHeaders = {
		   'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
		  
      };
	 

	   const shopRequestUrl = 'https://' + shop + '/admin/api/2019-07/recurring_application_charges.json?recurring_application_charge[name]=Easy Blog Creator&recurring_application_charge[price]=0.99&recurring_application_charge[return_url]='+forwardingAddress +'&recurring_application_charge[trial_days]=14';
	
	  
		request.post(shopRequestUrl, { headers: shopRequestHeaders} )
       .then((shopResponse) => {
		   
		
		 
		 const  shopResponseString   = shopResponse;
		  
		  const shopResponseObj = JSON.parse(shopResponseString);
		 const paymentConfirmationUrl = shopResponseObj.recurring_application_charge.confirmation_url;
		 
      
	
			
			  res.redirect(paymentConfirmationUrl);
			
		  
	
		
       }) .catch((error) => {
		  
		  var errorString =  JSON.stringify(error);
		   res.write(errorString);
		   res.end("");
        
       }); 
	
     
	
	
	 
	   
    })

  } else {
    res.status(400).send('Required parameters missing');
  }
});
     
	
	
     
	  

	  

    
    
	
     
	
	
	 
	   
    

 
