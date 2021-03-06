let convertPagination = function (articles, currentPage) {
    // 分頁處理
    let artilcesCount = articles.length;
    let perpageSize = 2;
    let pageTotal = Math.ceil(artilcesCount / perpageSize);
    if(currentPage > pageTotal) { currentPage = pageTotal };
    let startIndex = (currentPage * perpageSize) - perpageSize + 1;
    let endIndex = currentPage * perpageSize;
    // console.log('總資料筆數: ', artilcesCount, '每頁數量: ', perpageSize, '總頁數: ', pageTotal, '每頁第一筆: ', startIndex, '每頁最後一筆: ', endIndex);

    // 取出對應資料
    // .forEach方法
    // let articlesDisplay = [];
    // articles.forEach(function(item, index) {
    //   let itemNum = index + 1;
    //   if(itemNum >= startIndex && itemNum <= endIndex) {
    //     articlesDisplay.push(item);
    //   }
    // });

    // .slice方法
    let articlesDisplay = articles.slice(startIndex-1, endIndex);
    
    // 分頁相關資訊
    let page = {
        pageTotal,
        currentPage,
        hasPre: currentPage > 1,
        hasNext: currentPage < pageTotal
    }

    return { articlesDisplay, page }
}

module.exports = convertPagination;

