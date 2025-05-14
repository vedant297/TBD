const Staticmaster = require('../models/static_master')
const HolidayDestination = require('../models/holidaydestination')
const Package = require('../models/package')
const ContactDetail = require('../models/contact_detail')
const News = require('../models/news')
const Subscribe = require('../models/subscribe')
const Testimonial = require('../models/testimonials') 
const Blog = require('../models/blogs') 
const sanitizeHtml = require("sanitize-html");
const { storage } = require('../cloudinary')
const { ObjectId } = require("mongodb")

const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleString("en-GB", { month: "long" });
    const year = d.getFullYear(); 
    
    // Function to add ordinal suffix
    const getOrdinal = (n) => {
        if (n > 3 && n < 21) return "th"; // Covers 11th to 13th
        switch (n % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    };

    return `${day}${getOrdinal(day)} ${month} ${year}`;
}

const randomBGColor = () => { 
    const colors = ['#ff7b54', '#4CAF50', '#007bff', '#6f42c1', '#fd7e14', '#20c997', '#e83e8c',
  '#f94144', '#f3722c', '#f8961e', '#f9844a', '#90be6d', '#43aa8b', '#577590',
  '#2b2d42', '#8d99ae', '#00b4d8', '#48cae4', '#3a0ca3', '#4361ee', '#ff6f91',
  '#845ec2', '#ffc75f', '#0081cf', '#ffde7d', '#00c9a7', '#c34a36',
  '#ff4d4d', '#ff6b6b', '#ff9f1c', '#ffb347', '#ffcc00', '#e36414', '#d62828', '#e76f51',
  '#118ab2', '#06d6a0', '#00bcd4', '#1e90ff', '#89c2d9', '#219ebc', '#48bfe3', '#60d394',
  '#9d4edd', '#7b2cbf', '#c77dff', '#ff6f61', '#f06595', '#d291bc', '#e0aaff', '#f78da7',
  '#6b705c', '#a5a58d', '#b5838d', '#ccd5ae', '#d4a373', '#c9ada7', '#e6ccb2', '#a98467']; 
    
    return colors[Math.floor(Math.random() * colors.length)] 
} 

const fetchTestimonials = async () => {
    return await Testimonial.find({}).sort({ createTime: -1 }).limit(10) 
} 

const fetchPackages = async(destinationId = null) => {
    
    const pipeline = []; 

    if (destinationId) {
        const destination = await HolidayDestination.findById(destinationId).lean();

        if (!destination || !destination.location) {
            throw new Error('Invalid or missing destination');
        }

        pipeline.push(
      {
        $lookup: {
          from: "holidaydestinations",
          localField: "holidayDestinationID",
          foreignField: "_id",
          as: "destinationDetails"
        }
      },
      { $unwind: "$destinationDetails" },
      {
        $match: {
          "destinationDetails.location": destination.location
        }
      }
    );
    } 
    else 
    {
        pipeline.push(
      {
        $lookup: {
          from: "holidaydestinations",
          localField: "holidayDestinationID",
          foreignField: "_id",
          as: "destinationDetails"
        }
      },
      { $unwind: "$destinationDetails" }
    );
    }
  
  pipeline.push(
    {
      $lookup: {
        from: "holidayphotos",
        let: { photoIdsArray: "$destinationDetails.photoIds" },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", "$$photoIdsArray"] } } },
          { $sample: { size: 1 } }
        ],
        as: "photoDetails"
      }
    },
    {
      $unwind: {
        path: "$photoDetails",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        packageType: 1,
        price: 1,
        "destinationDetails._id": 1,
        "destinationDetails.location": 1,
        "destinationDetails.country": 1,
        "destinationDetails.packageName": 1,
        "destinationDetails.priceStartsFrom": 1,
        "destinationDetails.noOfDays": 1,
        "destinationDetails.tourType": 1,
        "destinationDetails.applicableDiscount": 1,
        "photoDetails.URL": 1
      }
    }
  );

  return await Package.aggregate(pipeline);
}

module.exports.renderHome = async (req, res) => {

    res.cookie('url', req.protocol + '://' + req.get('host'), {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true 
    });

    console.log('renderHome')

    const staticmasters = await Staticmaster.find({ static_type: { $in: ["aboutcompany1", "aboutcompany2", "aboutcompany3", "happycustomers"] } }).sort({ seq_no: 1 })

    const totaldetinations = await HolidayDestination.countDocuments({ active: 1 })

    const testimonials = await fetchTestimonials() 

    const holidaydestinations = await HolidayDestination.aggregate([
        { $sample: { size: 5 } },  // Get 5 random holiday destinations
        {
            $lookup: {
                from: "holidayphotos",  // Join with the HolidayPhotos collection
                localField: "photoIds", // Field in HolidayDestinations
                foreignField: "_id",    // Matching _id in HolidayPhotos
                as: "photoDetails"      // Store the joined data in photoDetails
            }
        },        
        {
            $lookup: {
            from: "holidayphotos",
            localField: "picture_450_490",
            foreignField: "_id",
            as: "picture_450_490"
            }
        },
        {
            $addFields: {
            picture_450_490: { $arrayElemAt: ["$picture_450_490", 0] }
            }
        },
        {
            $project: {
                photoIds: 0,  // Exclude the original photoIds array
                packageDetails: 0 // Exclude the full packageDetails array
            }
        }
    ])

    const packages = await fetchPackages("") 

    res.render('frontend/index', { staticmasters, holidaydestinations, totaldetinations, packages, testimonials, formatDate }) 
}

module.exports.renderAboutUs = async (req, res) => {

    try {
        const staticmasters = await Staticmaster.find({ static_type: { $in: ["aboutus", "happycustomers", "noofbookings"] } }).sort({ seq_no: 1 })

        const totaldestinations = await HolidayDestination.countDocuments({ active: 1 })

         const testimonials = await fetchTestimonials() 

        res.render('frontend/about', { staticmasters, totaldestinations, testimonials, formatDate }) 
    }
    catch (error) {
        console.error('Error loading refund policy page:', error);
        res.status(404).render('404');
    }
}

module.exports.renderContactUs = async (req, res) => {

    console.log('renderContactUs') 

    try {

        const testimonials = await fetchTestimonials() 

        // await console.log(testimonials) 

        res.render('frontend/contactus', {testimonials, formatDate}) 
    }
    catch (error) {
        console.error('Error loading refund policy page:', error);
        res.status(404).render('404');
    }
}

module.exports.renderFlights = async (req, res) => {

    console.log('renderFlights') 

    try {

        const testimonials = await fetchTestimonials() 

        res.render('frontend/flights', {formatDate}) 
    }
    catch (error) {
        console.error('Error loading Flights page:', error);
        res.status(404).render('404');
    }
} 

module.exports.renderHotels = async (req, res) => {

    console.log('renderHotels') 

    try {

        const testimonials = await fetchTestimonials() 

        res.render('frontend/hotels', {formatDate}) 
    }
    catch (error) {
        console.error('Error loading Hotels page:', error);
        res.status(404).render('404');
    }
}

module.exports.renderVisa = async (req, res) => {

    console.log('renderVisa') 

    try {

        const testimonials = await fetchTestimonials() 

        res.render('frontend/visa', {formatDate}) 
    }
    catch (error) {
        console.error('Error loading Visa page:', error);
        res.status(404).render('404');
    }
}

module.exports.renderCruise = async (req, res) => {

    console.log('renderCruise') 

    try {

        const testimonials = await fetchTestimonials() 

        res.render('frontend/cruise', {formatDate}) 
    }
    catch (error) {
        console.error('Error loading Cruise page:', error);
        res.status(404).render('404');
    }
}

module.exports.renderTravelInsurance = async (req, res) => {

    console.log('renderTravelInsurance') 

    try {

        const testimonials = await fetchTestimonials() 

        res.render('frontend/travel-insurance', {formatDate}) 
    }
    catch (error) {
        console.error('Error loading Travel Insurance page:', error);
        res.status(404).render('404');
    }
} 

module.exports.updateContactUs = async (req, res) => {

    try {
        const { email, mobile } = req.body.contactus;

        // Check if a record already exists with the same email and mobile
        const existingContact = await ContactDetail.findOne({ email, mobile });

        if (existingContact) {
            req.flash('error', 'Record already exists!')
            res.redirect("contactus")
        }

        // If no existing record, save the new contact detail
        const contactus = new ContactDetail(req.body.contactus);
        await contactus.save();

        req.flash('success', 'Successfully recorded!')
        res.redirect("contactus")

    } catch (error) {
        console.error("Error saving contact details:", error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports.updateSubscriber = async (req, res) => {

    console.log('updateSubscriber')

    try {
        const { email } = req.body.subscribe;

        // Check if a record already exists with the same email and mobile
        const existingContact = await Subscribe.findOne({ email });

        if (existingContact) {
            req.flash('error', 'Record already exists!')
            return res.redirect(req.get('Referer'))
        }

        // If no existing record, save the new contact detail
        const contactus = new Subscribe(req.body.subscribe);
        await contactus.save();

        req.flash('success', 'Successfully Subscribed!')
        return res.redirect(req.get('Referer'))

    } catch (error) {
        console.error("Error saving contact details:", error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports.renderTestimonials = async (req, res) => {

    console.log('renderTestimonials') 

    try {

        const testimonials = await Testimonial.find({}).sort({ createTime: -1 }).limit(10)

        const packages = await fetchPackages("") 

        // console.log(testimonials) 

        res.render('frontend/testimonials', {testimonials, packages, formatDate, randomBGColor}) 
    }
    catch (error) {
        console.error('Error loading Testimonials page:', error) 
        res.status(404).render('404') 
    }
}

module.exports.renderNews = async (req, res) => {

    console.log('renderNews')

    try {
        const news = await News.find().sort({ Date: -1 }) 

        const testimonials = await fetchTestimonials() 

        res.render('frontend/news', { news, formatDate, testimonials, formatDate })
    }
    catch (error) {
        console.error('Error loading refund policy page:', error);
        res.status(404).render('404');
    }
}

module.exports.renderBlogs = async (req, res) => {

    console.log('renderBlogs')

    try {    

        const blogs = await Blog.find().sort({ Date: -1 }) 

        const testimonials = await fetchTestimonials() 

        // console.log(blogs) 

        res.render('frontend/blogs', {blogs, formatDate, randomBGColor, testimonials, formatDate}) 
    }
    catch (error) {
        console.error('Error loading Blogs page:', error);
        res.status(404).render('404');
    }
}

module.exports.renderBlogDetail = async (req, res) => {

    console.log('renderBlogDetail')

    const id = req.params.id 

    if (!id) {
        res.render(`frontend/blogs`)
    }

    const { ObjectId } = require('mongodb');

    if (!ObjectId.isValid(id)) {
        return res.status(404).render('404');
    }

    try {        
        const blog = await Blog.findOne({ _id: new ObjectId(id) }) 

        const recentblogs = await Blog.find({}).sort({ createdate: -1 }).limit(5) 

        const url = req.cookies.url + '/blog-details/'+id 
        
        // console.log(url) 

        // await console.log(blog) 

        res.render('frontend/blog-details', { blog, recentblogs, formatDate, randomBGColor, url }) 
    }
    catch (error) {
        console.error('Error loading blog detail page:', error);
        res.status(404).render('404');
    } 
}

module.exports.renderNewsDetail = async (req, res) => {

    console.log('renderNewsDetail')

    const id = req.params.id 

    if (!id) {
        res.render(`frontend/news`)
    }

    const { ObjectId } = require('mongodb');

    if (!ObjectId.isValid(id)) {
        return res.status(404).render('404');
    }

    try {
        const newsdetail = await News.findOne({ _id: new ObjectId(id) }) 

        const testimonials = await fetchTestimonials() 

        // await console.log(newsdetail) 

        res.render('frontend/news-details', { newsdetail, formatDate }) 
    }
    catch (error) {
        console.error('Error loading refund policy page:', error);
        res.status(404).render('404');
    }
}

module.exports.renderPrivacyPolicy = async (req, res) => {

    console.log('renderPrivacyPolicy')

    try {
        const staticmasters = await Staticmaster.find({ static_type: { $in: ["privacypolicy", "happycustomers", "noofbookings"] } }).sort({ seq_no: 1 })

        const totaldestinations = await HolidayDestination.countDocuments({ active: 1 })

        const testimonials = await fetchTestimonials() 

        res.render('frontend/privacypolicy', { staticmasters, totaldestinations, testimonials, formatDate })
    }
    catch (error) {
        console.error('Error loading refund policy page:', error);
        res.status(404).render('404');
    }
}

module.exports.renderTermsOfUse = async (req, res) => {

    console.log('renderTermsOfUse')

    try {
        const staticmasters = await Staticmaster.find({ static_type: { $in: ["termsofuse", "happycustomers", "noofbookings"] } }).sort({ seq_no: 1 })

        const totaldestinations = await HolidayDestination.countDocuments({ active: 1 })

        const testimonials = await fetchTestimonials() 

        res.render('frontend/terms-of-use', { staticmasters, totaldestinations, testimonials, formatDate })
    }
    catch (error) {
        console.error('Error loading refund policy page:', error);
        res.status(404).render('404');
    }
}

module.exports.renderRefundPolicy = async (req, res) => {

    console.log('renderRefundPolicy')

    try {
        const staticmasters = await Staticmaster.find({ static_type: { $in: ["refundpolicy", "happycustomers", "noofbookings"] } }).sort({ seq_no: 1 })

        const totaldestinations = await HolidayDestination.countDocuments({ active: 1 })

        const testimonials = await fetchTestimonials() 

        res.render('frontend/refund-policy', { staticmasters, totaldestinations, testimonials, formatDate }) 
    }
    catch (error) {
        console.error('Error loading refund policy page:', error);
        res.status(404).render('404');
    }
}

module.exports.renderCorporate = async (req, res) => {

    console.log('renderCorporate')

    try {
        const staticmasters = await Staticmaster.find({ static_type: { $in: ["corporate", "happycustomers", "noofbookings"] } }).sort({ seq_no: 1 })

        const totaldestinations = await HolidayDestination.countDocuments({ active: 1 })

        const testimonials = await fetchTestimonials() 

        res.render('frontend/corporate', { staticmasters, totaldestinations, testimonials, formatDate }) 
    }
    catch (error) {
        console.error('Error loading corporate page:', error);
        res.status(404).render('404');
    }
}

module.exports.renderDestinationDropdown = async (req, res) => {

    console.log('renderDestinationDropdown')

    const destinations = await HolidayDestination.distinct("location")

    const query = req.query.query ? req.query.query.toLowerCase() : ""

    const results = query
        ? destinations.filter(dest => dest.toLowerCase().includes(query))
        : destinations

    res.json(results)
}

module.exports.renderDestination = async (req, res) => {

    console.log('renderDestination')

    const allowedQueryParams = ['destination', 'minPrice', 'maxPrice', 'ratings'];
    const queryKeys = Object.keys(req.query);

    const isValidQuery = queryKeys.every(key => allowedQueryParams.includes(key));

    if (!isValidQuery) {
        return res.status(404).render('404');
    }

    let filters = {}

    let { destination, minPrice, maxPrice, ratings } = req.query

    // console.log(req.query)

    // if (!destination) {
    //     res.render(`frontend/tour-search`)
    // }

    // Add destination filter
    if (destination) {
        filters.location = destination
    }

    // Add minPrice & maxPrice filter if provided
    if (minPrice && maxPrice) {
        filters.priceStartsFrom = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) }
    } else if (minPrice) {
        filters.priceStartsFrom = { $gte: parseInt(minPrice) }
    } else if (maxPrice) {
        filters.priceStartsFrom = { $lte: parseInt(maxPrice) }
    }

    // Add rating filter if provided
    if (ratings) {
        filters.rating = { $in: ratings.split(",").map(Number) }  // Convert "5,4" to [5,4] 
    }

    const holidaydestinations = await HolidayDestination.aggregate([
        {
            $match: filters // Filter destinations where destination = "Bali" 
        },
        {
            $lookup: {
                from: "holidayphotos",  // Join with the HolidayPhotos collection
                localField: "photoIds", // Field in HolidayDestination
                foreignField: "_id",    // Matching _id in HolidayPhotos
                as: "photoDetails"      // Store the joined data in photoDetails
            }
        },
        {
            $lookup: {
                from: "packages",  // Join with the Packages collection 
                localField: "_id", // Match holidayDestinationID in Packages 
                foreignField: "holidayDestinationID",
                as: "packageDetails"
            }
        },
        {
            $addFields: {
                minPriceStartsFrom: {
                    $min: "$packageDetails.price" // Find the minimum price
                }
            }
        },
        {
            $project: {
                photoIds: 0,  // Exclude the original photoIds array
                packageDetails: 0 // Exclude the full packageDetails array
            }
        }
    ])

    if (!holidaydestinations || holidaydestinations.length === 0) {
        return res.status(404).render('404');
    }

    // await console.log(holidaydestinations) 

    const testimonials = await fetchTestimonials() 

    res.render('frontend/tour-search', { holidaydestinations, minPrice, maxPrice, ratings, testimonials, formatDate }) 
}

module.exports.renderPackages = async (req, res) => {

    console.log('renderPackages')

    const holidayDestinationID = req.params.holidayDestinationID

    if (!holidayDestinationID) {
        res.render(`frontend/tour-search`)
    }

    const { ObjectId } = require('mongodb');

    if (!ObjectId.isValid(holidayDestinationID)) {
        return res.status(404).render('404');
    }

    const holidaydestinations = await HolidayDestination.aggregate([
        {
            $match: { _id: new ObjectId(holidayDestinationID) } // Ensure correct ObjectId filtering
        },
        {
            $lookup: {
                from: "holidayphotos",
                localField: "photoIds",
                foreignField: "_id",
                as: "photoDetails"
            }
        },
        {
            $lookup: {
                from: "packages",
                localField: "_id",
                foreignField: "holidayDestinationID",
                as: "packageDetails"
            }
        },
        {
            $addFields: {
                minPriceStartsFrom: { $min: "$packageDetails.price" } // Get the minimum price
            }
        },
        {
            $project: {
                photoIds: 0
            }
        }
    ])

    if (!holidaydestinations || holidaydestinations.length === 0) {
        return res.status(404).render('404');
    }

    const testimonials = await fetchTestimonials() 

    const packages = await fetchPackages(holidayDestinationID) 

    res.render('frontend/tour-details', { holidaydestination: holidaydestinations[0], packages, testimonials, formatDate }) 
} 