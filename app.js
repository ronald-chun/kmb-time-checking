const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPad Pro landscape'];
const sleep = require('sleep');

var express = require('express');
var app = express();
app.use(express.static('.'));

var route = '11b';

async function getTime(page){
	await page.evaluate( () => {
		$('#busDetailsRouteNo').next().next().next().children().click();
	});

	sleep.msleep(2000);

	await page.evaluate( () => {
		$("td#tdStop12 + td + td").click();
	});

	sleep.msleep(2000);

	let timeString = await page.evaluate(() => {
		var time = $(".esriPopupWrapper table table tbody tr:nth-child(2) td").text();
		return time;
	});
	let timeStringArray = timeString.split(" ");
	if(timeStringArray.length > 1){
		let time = parseInt(timeStringArray[0]);
		console.log("ETA: " + time + "min");
		return time;
	}else{
		console.log("ETA Error: " + timeString);
		return timeString;
	}
}

// (async () => {
// 	const browser = await puppeteer.launch({headless: true});
// 	const page = await browser.newPage();
//
// 	await page.goto('http://search.kmb.hk/KMBWebSite/index.aspx?lang=tc');
//
// 	sleep.msleep(2000);
//
// 	await page.evaluate( (route) => {
// 		$("#imgRouteSearchIcon").click();
// 		$("input.dijitInputInner").val(route);
// 		$("#routeSearchButton").click();
// 	}, route);
//
// 	sleep.msleep(2000);
//
// 	setInterval(async () => {
// 		await getTime(page);
// 	}, 1 * 60 * 1000);
//
// 	await getTime(page);
// 	//await browser.close();
// })();

async function get_web() {
	const browser = await puppeteer.launch({headless: true});
	const page = await browser.newPage();
	var eta = '';

	await page.goto('http://search.kmb.hk/KMBWebSite/index.aspx?lang=tc');

	sleep.msleep(2000);

	await page.evaluate( (route) => {
		$("#imgRouteSearchIcon").click();
		$("input.dijitInputInner").val(route);
		$("#routeSearchButton").click();
	}, route);

	sleep.msleep(2000);

	eta = await getTime(page);
	result = {route: route, eta: eta};

	await browser.close();
	return await result;

}

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.get('/getTime', async (req, res) => {
	try {
		const eta = await get_web();
		res.send(eta);
	} catch (e) {
		console.log(e);
	}
});


app.listen(4000, function(){
	console.log('Server is running');
});