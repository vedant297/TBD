const express = require('express')
const router = express.Router({ mergeParams: true })
const catchAsync = require('../utils/catchAsync')
const frontendController = require('../controllers/frontend')

router.get('/tour-detail/:holidayDestinationID', catchAsync(frontendController.renderPackages)) 

router.get('/aboutus', catchAsync(frontendController.renderAboutUs)) 

router.post('/subscribe', catchAsync(frontendController.updateSubscriber)) 

router.route('/contactus')
.get(catchAsync(frontendController.renderContactUs))
.post(catchAsync(frontendController.updateContactUs)) 

router.get('/privacypolicy', catchAsync(frontendController.renderPrivacyPolicy)) 

router.get('/corporate', catchAsync(frontendController.renderCorporate)) 

router.get('/flights', catchAsync(frontendController.renderFlights)) 

router.get('/hotels', catchAsync(frontendController.renderHotels)) 

router.get('/visa', catchAsync(frontendController.renderVisa)) 

router.get('/cruise', catchAsync(frontendController.renderCruise)) 

router.get('/travel-insurance', catchAsync(frontendController.renderTravelInsurance)) 

router.get('/blog-details/:id', catchAsync(frontendController.renderBlogDetail)) 

router.get('/blogs', catchAsync(frontendController.renderBlogs)) 

router.get('/news-details/:id', catchAsync(frontendController.renderNewsDetail)) 

router.get('/news', catchAsync(frontendController.renderNews)) 

router.get('/testimonials', catchAsync(frontendController.renderTestimonials)) 

router.get('/terms-of-use', catchAsync(frontendController.renderTermsOfUse)) 

router.get('/refund-policy', catchAsync(frontendController.renderRefundPolicy)) 

router.get('/top-destinations-details/:destination', catchAsync(frontendController.renderDestination)) 

router.get('/top-destinations-details', catchAsync(frontendController.renderDestination)) 

router.get('/search-destinations', catchAsync(frontendController.renderDestinationDropdown)) 

router.get('/', catchAsync(frontendController.renderHome)) 

module.exports = router 