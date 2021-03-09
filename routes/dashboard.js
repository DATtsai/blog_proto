// 路由設計
// 1.新增功能: .push().key取得firebase給定之uid，用.set()將資料加入。使用者輸入path需為互斥，要與資廖庫進行判斷
// 2.呈現功能
// 3.刪除功能: 傳遞id可選用params或query設計，回傳處理後訊息，則需session和flash()協助

var express = require('express');
var router = express.Router();
var moment = require('moment');
var striptags = require('striptags');

var firebaseDB = require('../connections/firebase_admin')
const categoriesRef = firebaseDB.ref('categories');
const articlesRef = firebaseDB.ref('articles');
const usersRef = firebaseDB.ref('users');

var convertPagination = require('../modules/convertPagination');

router.get('/', function(req, res) {
    let articles = [];
    let totalViews = 0;
    let publicCount = 0;
    let draftCount = 0;
    articlesRef.orderByChild('views').once('value')
        .then(function(snapshot) {
            snapshot.forEach((item) => {
                totalViews+=item.val().views;
                if(item.val().status === 'public') {
                    publicCount+=1;
                }else 
                if(item.val().status === 'draft') {
                    draftCount+=1;
                }
                articles.push(item.val());
            })
            articles.reverse();
            
            return usersRef.child(req.session.uid).once('value')
        })
        .then(function(snapshot) {
            let nickname =  '';
            if(snapshot.val()) {
                nickname = snapshot.val().nickname;
            }
            // console.log(totalViews, publicCount, draftCount)
            res.render('dashboard/admin', { totalViews, articles, publicCount, draftCount, nickname });
        })
    // res.redirect('/dashboard/archives')
});

router.post('/admin.update', function(req, res) {
    let uid = req.session.uid;
    let email = req.session.email;
    let nickname = req.body.nickname;
    usersRef.child(uid).set({uid, email, nickname});
    res.redirect('/dashboard/');
});

router.get('/article/create', function(req, res) {
    categoriesRef.once('value')
        .then(function(snapshot) {
            let categories = snapshot.val();
            // console.log(categories);
            res.render('dashboard/article', { categories });
        })
});

router.post('/article.create', function(req, res) {
    // console.log(req.body);
    let data = req.body;
    let articleRef = articlesRef.push();
    let key = articleRef.key;
    let updateTime = Math.floor( Date.now() / 1000 ); // 取得現在時間timestamp
    data.id = key;
    data.update_time = updateTime;
    data.views = 0;
    // console.log(data);
    articleRef.set(data)
        .then(function() {
            res.redirect(`/dashboard/archives`);
        })
});

router.get('/article/:id', function(req, res) {
    let id = req.params.id;
    console.log(id);
    let categories = {};
    categoriesRef.once('value')
        .then(function(snapshot) {
            categories = snapshot.val();
            return articlesRef.child(id).once('value')
        })
        .then(function(snapshot) {
            let article = snapshot.val();
            // console.log(article);
            res.render('dashboard/article', { categories, article });
        })
});

router.post('/article.update', function(req, res) {
    // console.log(req.body);
    let data = req.body;
    let id = req.query.id;
    // console.log(data);
    articlesRef.child(id).update(data)
        .then(function() {
            res.redirect(`/dashboard/article/${id}`);
        })
});

router.post('/article.delete', function(req, res) {
    let id = req.query.id;
    // console.log(id);
    articlesRef.child(id).remove();
    req.flash('info', '文章已刪除');
    res.send('文章已刪除')
    res.end();
})

router.get('/archives', function(req, res) {
    let currentPage = Number.parseInt(req.query.page) || 1;
    let status = req.query.status || 'public';
    let categories = {};
    categoriesRef.once('value')
        .then(function(snapshot) {
            categories = snapshot.val();
            return articlesRef.orderByChild('update_time').once('value');
        })
        .then(function(snapshot) {
            let articles = [];
            snapshot.forEach(function(item){  // 對物件進行forEach是firebase的語法，而不是js原生陣列語法
                if(status === item.val().status) {
                    articles.push(item.val());
                }
            });
            articles.reverse(); // 調整最新文章在陣列最前面
            // console.log(categories, articles);
            let data = convertPagination(articles, currentPage);
            let articlesDisplay = data.articlesDisplay;
            let page = data.page; 

            res.render('dashboard/archives', { categories, articles: articlesDisplay, status, page, moment, striptags });
        })
});

router.get('/categories', function(req, res) {
    let message = req.flash('info');
    categoriesRef.once('value', function(snapshot) {
        let categories = snapshot.val();
        // console.log(categories);
        res.render('dashboard/categories', { categories, message, hasInfo: message.length > 0 });
    })
});

router.post('/category.create', function(req, res) {
    let data = req.body;
    // console.log(data);
    let categoryRef = categoriesRef.push();
    let key = categoryRef.key;
    data.id = key;
    // path要互斥，需確保使用者輸入的path與資料庫內不重覆
    categoriesRef.orderByChild('path').equalTo(data.path).once('value')
        .then(function(snapshot) {
            if(snapshot.val() !== null) {
                req.flash('info', '已有相同的路徑');
                res.redirect('/dashboard/categories');
            }else{
                categoryRef.set(data)
                    .then(function() {
                        res.redirect('/dashboard/categories');
                    })
            }
        })
});

router.post('/category.update', function(req, res) {
    let id = req.query.id;
    let data = req.body;
    console.log(id, data);
    categoriesRef.child(id).update(data)
        .then(function() {
            req.flash('info', '欄位已更新');
            res.redirect('/dashboard/categories');
        })
})

router.post('/category.delete', function(req, res) {
    let id = req.query.id;
    // console.log(id);
    categoriesRef.child(id).remove();
    req.flash('info', '欄位已刪除');
    res.redirect('/dashboard/categories');
})

module.exports = router;