const multer=require('multer')
const {v4 : uuidv4} = require('uuid')
let imageName;
var storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'public/product-images')
    },
    filename:function(req,file,cb){
        const uniqueSuffix=Date.now()+ '-' + Math.round(Math.random()* 1E9)
        imageName = file.fieldname + '-' + uniqueSuffix
        cb(null,imageName)
    
    }
})

var upload = multer({storage:storage})
const multipleUpload = upload.fields([{ name: 'main_image', maxCount: 1 },{ name: 'sub_image', maxCount: 3 }])

module.exports={upload:multipleUpload,imageName}