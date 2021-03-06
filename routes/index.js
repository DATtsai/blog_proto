// 路由設計與分頁處理
// 1.取得文章列表
// 2.取得文章資料
// 3.製作分頁
// 4.學習將頁碼程式碼抽出成獨立module重複使用

var express = require('express');
var router = express.Router();
var moment = require('moment');
var striptags = require('striptags');

var firebaseDB = require('../connections/firebase_admin')
const categoriesRef = firebaseDB.ref('categories');
const articlesRef = firebaseDB.ref('articles');
const usersRef = firebaseDB.ref('users');

var convertPagination = require('../modules/convertPagination');

/* GET home page. */
router.get('/', function(req, res, next) {
  let currentPage = Number.parseInt(req.query.page) || 1;
  let categories = {};
  categoriesRef.once('value')
    .then(function(snapshot) {
      categories = snapshot.val();
      return articlesRef.orderByChild('update_time').once('value')
    })
    .then(function(snapshot) {
      let articles = [];
      snapshot.forEach(function(item) {
        if(item.val().status === 'public') {
          articles.push(item.val());
        }
      });
      articles.reverse();
      
      // 將頁碼程式碼抽取出來轉為module
      // 分頁處理
      // let artilcesCount = articles.length;
      // let perpageSize = 2;
      // let pageTotal = Math.ceil(artilcesCount / perpageSize);
      // if(currentPage > pageTotal) { currentPage = pageTotal };
      // let startIndex = (currentPage * perpageSize) - perpageSize + 1;
      // let endIndex = currentPage * perpageSize;
      // // console.log('總資料筆數: ', artilcesCount, '每頁數量: ', perpageSize, '總頁數: ', pageTotal, '每頁第一筆: ', startIndex, '每頁最後一筆: ', endIndex);

      // // 取出對應資料
      // // .forEach方法
      // // let articlesDisplay = [];
      // // articles.forEach(function(item, index) {
      // //   let itemNum = index + 1;
      // //   if(itemNum >= startIndex && itemNum <= endIndex) {
      // //     articlesDisplay.push(item);
      // //   }
      // // });

      // // .slice方法
      // let articlesDisplay = articles.slice(startIndex-1, endIndex);
      
      // // 分頁相關資訊
      // let page = {
      //   pageTotal,
      //   currentPage,
      //   hasPre: currentPage > 1,
      //   hasNext: currentPage < pageTotal
      // }

      let data = convertPagination(articles, currentPage);
      let articlesDisplay = data.articlesDisplay;
      let page = data.page; 

      res.render('index', { categories, articles: articlesDisplay, page, moment, striptags })
    })
});

router.get('/category/:category', function(req, res) {
  let categoryPath = req.params.category;
  let categoryID;
  let currentPage = Number.parseInt(req.query.page) || 1;
  categoriesRef.once('value')
  .then(function(snapshot) {
    snapshot.forEach((item) => {
      if(item.val().path === categoryPath) {
        categoryID = item.val().id;
      }
    });
    categories = snapshot.val();
    return articlesRef.orderByChild('update_time').once('value')
  })
  .then(function(snapshot) {
    let articles = [];
    snapshot.forEach((item) => {
      if(item.val().category === categoryID && item.val().status === 'public'){
        articles.push(item.val());
      }
    })
    articles.reverse();
    let data = convertPagination(articles, currentPage);
    let articlesDisplay = data.articlesDisplay;
    let page = data.page; 
    res.render('index', { categories, articles: articlesDisplay, page, moment, striptags })
  })
});

router.get('/post/:id', function(req, res) {
  let id = req.params.id;
  let categories = {};
  let author = 'DAT';
  categoriesRef.once('value')
    .then(function(snapshot) {
      categories = snapshot.val();
      return usersRef.child(process.env.ADMIN_UID).once('value')
    })
    .then(function(snapshot) {
      if(snapshot.val()){
        author = snapshot.val().nickname;
      }
      return articlesRef.child(id).once('value')
    })
    .then(function(snapshot) {
      let article = snapshot.val();
      if(!article) {
        return res.render('error', { title: 'oops！找不到該文章!'});
      }
      article.views+=1; 
      articlesRef.child(id).update(article);
      res.render('post', { categories, article, moment, author })
    })
});

module.exports = router;
