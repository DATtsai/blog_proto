let articles = document.getElementById('articles');

articles.addEventListener('click', function(e){
    e.preventDefault();
    if(e.target.classList.contains('deletePost')) {    
        let deletePost = e.target;
        let id = deletePost.dataset.id;
        let title = deletePost.dataset.title;
        if(confirm('確認是否刪除 '+title)) {
            let xhr = new XMLHttpRequest();
            xhr.open('post', `/dashboard/article.delete?id=${id}`);
            xhr.send();
            xhr.onload = function() {
                let response = xhr.responseText;
                console.log(response);
                // window.location = '/dashboard/archives';
                window.location.reload();
            }
        }
    }
    else if(e.target.classList.contains('editPost')) {
        let editPost = e.target;
        let id = editPost.dataset.id;
        window.location.assign(`/dashboard/article/${id}`);
    }
    else if(e.target.classList.contains('previewPost')) {
        let previewPost = e.target;
        let id = previewPost.dataset.id;
        window.open(`/post/${id}`);        
    }
    else{
        return;
    }
})