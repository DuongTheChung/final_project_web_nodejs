var express=require('express');
var router=express.Router();

var Page=require('../models/page');

router.get('/',(req,res)=>{
    Page.find({}).sort({sorting:1}).exec((err,pages)=>{
        res.render('admin/pages',{
            pages:pages
        });
    });
});

//GET add-page
router.get('/add-page',(req,res)=>{
    var title="";
    var slug="";
    var content="";

    res.render('admin/add-page',{
        title:title,
        slug:slug,
        content:content
    });
});

//POST add-page
router.post('/add-page',(req,res)=>{

    req.checkBody('title','Title must have a value').notEmpty();
    req.checkBody('content','Content must have a value').notEmpty();

    var title =req.body.title;
    var slug=req.body.slug.replace(/\s+/g,'-').toLowerCase();
    if(slug=="")
        slug=title.replace(/\s+/g,'-').toLowerCase();
    var content=req.body.content;

    var errors=req.validationErrors();
    
    if(errors)
    {
        res.render('admin/add-page',{
            errors:errors,
            title:title,
            slug:slug,
            content:content
        });
    }
    else{
        Page.findOne({slug:slug},(err,page)=>{
            if(page){
                req.flash('danger','Page slug exists ,choose another.');
                res.render('admin/add-page',{
                    title:title,
                    slug:slug,
                    content:content
                });
            }
            else{
                var page=new Page({
                    title:title,
                    slug:slug,
                    content:content,
                    sorting:100
                });
                
                page.save((err)=>{
                    if(err){
                        return console.log(err);
                    }
                    else{
                        req.flash('Success','Page added');
                        res.redirect('/admin/pages');
                    }
                });
            }
        });
    }
});

router.post('/reorder-page',(req,res)=>{
    var ids=req.body['id[]'];
    var count=0;
    for(var i=0;i<ids.length;i++){
        var id=ids[i];
        count++;
        
        Page.findById(id,(err,page)=>{
            page.sorting=count;
            page.save(err=>{
                if(err)
                    return console.log(err);
            });
        });
    }
});

module.exports=router;