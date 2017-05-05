var request = require('request'),
	fs = require('fs'),
	request = require('request'),
	cheerio = require('cheerio'); 

url = "https://www.55places.com"
pageLinks = []
communityLinks = []
results = []

function getPages(state) {
	return new Promise(function (resolve, reject) {
		request.get(url + "/" + state, function(err, res, html) {
			if (err) {
				reject(err)
			}
			var $ = cheerio.load(html)
			var $aSet = $('.template__communityResults--pagination ul').first().find('a');
			$aSet.each(function (i, elem) {
				if (i != $aSet.length - 1) {
					pageLinks.push(url + ($(elem).attr('href')))
				}
			})
			$('.template__communityResults--button').each(function (i, elem) {
				communityLinks.push(url + ($(elem).attr('href')))
			})
			resolve()
		})
	})
}

function getCommunities() {
	return Promise.all(pageLinks.map(function(link){
		return new Promise(function (resolve, reject) {
			request.get(link, function (err, res, html) {
				if (err) {
					reject(err)
				}
				var $ = cheerio.load(html)
				$('.template__communityResults--button').each(function (i, elem) {
					communityLinks.push(url + ($(elem).attr('href')))
				})
				resolve()
			})
		})
	}))
}

function getCommunityData() {
	return Promise.all(communityLinks.map(function(link) {
		return new Promise(function (resolve, reject) {
			request.get(link, function (err, res, html) {
				if (err) {
					reject(err)
				}
				var $ = cheerio.load(html)


				var $quickFacts = $('.widget__quickFacts--facts').first().find('dd')
				var price_range = $quickFacts.eq(0).text()
				var home_types = $quickFacts.eq(1).text()
				var number_of_homes = $quickFacts.eq(2).text()
				var new_resale = $quickFacts.eq(3).text()
				var age_restrictions = $quickFacts.eq(4).text()
				var gated = $quickFacts.eq(5).text()
				var construction_dates = $quickFacts.eq(6).text()
				//var builder = $quickFacts.eq(7).text() PROBLEM HERE
	

				var amenities_list = []
				$('#tab-pane--community-amenities').find('li').each(function (i, elem) {
					amenities_list.push($(elem).text())
				})
				var clubs_groups_activities_and_classes = []
				$('#tab-pane--community-lifestyle').find('li').each(function (i, elem) {
					clubs_groups_activities_and_classes.push($(elem).text())
				})


				var addressInfo = []
				$('#tab-pane--community-map').find('address').contents().each(function (i, elem){
					if ($(elem).text().trim() != '') {
						addressInfo.push($(elem).text().trim())
					}
				})
				var community_name = addressInfo[0]
				console.log(community_name)
				var address = addressInfo[1]
				var city = addressInfo[2].split(",")[0]
				var state = addressInfo[2].split(",")[1].split(" ")[1]
				var zipcode = addressInfo[2].split(",")[1].split(" ")[2]
				var fullAddress = address + ", " + city + ", " + state


				// var overviewHeaders = []
				// overviewHeaders.push($('#tab-pane--community-overview').children().first())
				// $('#tab-pane--community-overview').children().has('strong').each(function (i, elem) {
				// 	overviewHeaders.push($(elem))
				// })
				// var overview = ''
				// overviewHeaders[0].nextUntil(overviewHeaders[1]).each(function (i, elem){
				// 	overview += ($(elem).text())
				// })
				// var amenities = ''
				// overviewHeaders[1].nextUntil(overviewHeaders[2]).each(function (i, elem) {
				// 	amenities += ($(elem).text())
				// })
				// var homes_and_real_estate = ''
				// overviewHeaders[2].nextUntil(overviewHeaders[3]).each(function (i, elem) {
				// 	homes_and_real_estate += ($(elem).text())
				// })
				// var lifestyle = ''
				// overviewHeaders[3].nextUntil(overviewHeaders[4]).each(function (i, elem){
				// 	lifestyle += ($(elem).text())
				// })
				// var area = ''
				// overviewHeaders[4].nextAll().each(function (i, elem){
				// 	area += ($(elem).text())
				// })


				var url = link
				var slug = url.split('/').slice(-1)[0]

			

				// results.push({
				// 	"community_name": community_name,
				// 	"number_of_homes": number_of_homes,
				// 	"city": city,
				// 	"lifestyle": lifestyle,
				// 	"clubs_groups_activities_and_classes": clubs_groups_activities_and_classes,
				// 	"area": area,
				// 	"url": url,
				// 	"homes_and_real_estate": homes_and_real_estate,
				// 	"builder": builder,
				// 	"address": address,
				// 	"price_range": price_range,
				// 	"new_resale": new_resale,
				// 	"state": state,
				// 	"construction_dates": construction_dates,
				// 	"amenities": amenities,
				// 	"gated": gated,
				// 	"home_types": home_types,
				// 	"overview": overview,
				// 	"age_restrictions": age_restrictions,
				// 	"amenities_list": amenities_list,
				// 	"zipcode": zipcode,
				// 	"slug": slug,
				// 	"fullAddress" : fullAddress
				//})
				resolve()				
			})
		})
	}))
}


function scrape(state) {
	getPages(state)
		.then(function(){
			getCommunities()
			.then(function() {
				getCommunityData()
			})
		})	
}

scrape('california')







