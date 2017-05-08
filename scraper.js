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
				var communityData = {}
				var $ = cheerio.load(html)


				var addressInfo = []
				$('#tab-pane--community-map').find('address').contents().each(function (i, elem){
					if ($(elem).text().trim() != '') {
						addressInfo.push($(elem).text().trim())
					}
				})
				var community_name = addressInfo[0]
				communityData["community_name"] = community_name

				var address = addressInfo[1]
				communityData["address"] = address

				var city = addressInfo[2].split(",")[0]
				communityData["city"] = city

				var state = addressInfo[2].split(",")[1].split(" ")[1]
				communityData["state"] = state

				var zipcode = addressInfo[2].split(",")[1].split(" ")[2]
				communityData["zipcode"] = zipcode

				var fullAddress = address + ", " + city + ", " + state
				communityData["fullAddress"] = fullAddress


				var $quickFacts = $('.widget__quickFacts--facts').first().find('dd')

				var price_range = $quickFacts.eq(0).text()
				communityData["price_range"] = price_range

				var home_types = $quickFacts.eq(1).text()
				communityData["home_types"] = home_types

				var number_of_homes = $quickFacts.eq(2).text()
				communityData["number_of_homes"] = number_of_homes

				var new_resale = $quickFacts.eq(3).text()
				communityData["new_resale"] = new_resale

				var age_restrictions = $quickFacts.eq(4).text()
				communityData["age_restrictions"] = age_restrictions

				var gated = $quickFacts.eq(5).text()
				communityData["gated"] = gated

				var construction_dates = $quickFacts.eq(6).text()
				communityData["construction_dates"] = construction_dates

				if ($quickFacts.length == 9) {
					var builder = $quickFacts.eq(7).text()
					communityData["builder"] = builder
				}
				else if ($quickFacts.length == 10) {
					var builder = $quickFacts.eq(7).text() + ", " + $quickFacts.eq(8).text()
					communityData["builder"] = builder
				}


				var amenities_list = []
				$('#tab-pane--community-amenities').find('li').each(function (i, elem) {
					amenities_list.push($(elem).text())
				})
				if (amenities_list.length != 0) {
					communityData["amenities_list"] = amenities_list
				}

				var clubs_groups_activities_and_classes = []
				$('#tab-pane--community-lifestyle').find('li').each(function (i, elem) {
					clubs_groups_activities_and_classes.push($(elem).text())
				})
				if (clubs_groups_activities_and_classes.length != 0) {
					communityData["clubs_groups_activities_and_classes"] = clubs_groups_activities_and_classes
				}

				
				var overviewHeaders = []
				overviewHeaders.push($('#tab-pane--community-overview').children().first())
				$('#tab-pane--community-overview').children().find('p strong').each(function (i, elem) {
					if ($(elem).text().trim() != '') {
						overviewHeaders.push($(elem).parent())
					}
				})
				if (overviewHeaders.length == 1)
				{
					overview = ''
					overviewHeaders[0].nextAll().each(function (i, elem) {
						overview += ($(elem).text())
					})
					communityData["overview"] = overview
				}
				else if (overviewHeaders.length == 4)
				{
					var overview = ''
					overviewHeaders[0].nextUntil(overviewHeaders[1]).each(function (i, elem){
				 		overview += ($(elem).text())
					})
					communityData["overview"] = overview

					var amenities_and_lifestyle = ''
					overviewHeaders[1].nextUntil(overviewHeaders[2]).each(function (i, elem) {
				 		amenities_and_lifestyle += ($(elem).text())
					})
					communityData["amenities_and_lifestyle"] = amenities_and_lifestyle

					var homes_and_real_estate = ''
					overviewHeaders[2].nextUntil(overviewHeaders[3]).each(function (i, elem) {
				 		homes_and_real_estate += ($(elem).text())
				 	})
				 	communityData["homes_and_real_estate"] = homes_and_real_estate

				 	var area = ''
				 	overviewHeaders[3].nextAll().each(function (i, elem){
				 		area += ($(elem).text())
					})
					communityData["area"] = area
				}
				else {
					var overview = ''
					overviewHeaders[0].nextUntil(overviewHeaders[1]).each(function (i, elem) {
						overview += ($(elem).text())
					})
					communityData["overview"] = overview

					var amenities = ''
					overviewHeaders[1].nextUntil(overviewHeaders[2]).each(function (i, elem) {
						amenities += ($(elem).text())
					})
					communityData["amenities"] = amenities

					var homes_and_real_estate = ''
					overviewHeaders[2].nextUntil(overviewHeaders[3]).each(function (i, elem) {
						homes_and_real_estate += ($(elem).text())
					})
					communityData["homes_and_real_estate"] = homes_and_real_estate

					var lifestyle = ''
					overviewHeaders[3].nextUntil(overviewHeaders[4]).each(function (i, elem){
						lifestyle += ($(elem).text())
					})
					communityData["lifestyle"] = lifestyle

					var area = ''
					overviewHeaders[4].nextAll().each(function (i, elem){
						area += ($(elem).text())
					})
					communityData["area"] = area
				}

				communityData['url'] = link
				var slug = link.split('/').slice(-1)[0]
				communityData["slug"] = slug

				results.push(communityData)
				resolve()				
			})
		})
	}))
}


function getJson(){
	fs.writeFile("communityData", JSON.stringify(results, null, "\t"), function(err){
		if (err){
			console.log(err)
		}
		else {
			console.log('success')
		}
	})
}


function scrape(state) {
	getPages(state)
		.then(function(){
			getCommunities()
			.then(function() {
				getCommunityData()
				.then(function() {
					getJson()
				})
			})
		})	
}

scrape('california')








