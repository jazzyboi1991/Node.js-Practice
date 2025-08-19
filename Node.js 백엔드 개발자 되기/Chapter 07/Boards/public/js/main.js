// 날짜 포맷팅 함수
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return date.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    } else if (diffDays < 7) {
        return `${diffDays}일 전`;
    } else {
        return date.toLocaleDateString('ko-KR');
    }
}

// 파일 크기 포맷팅
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 폼 유효성 검사
function validateForm(form) {
    const title = form.querySelector('#title').value.trim();
    const author = form.querySelector('#author').value.trim();
    const content = form.querySelector('#content').value.trim();
    
    if (!title) {
        alert('제목을 입력해주세요.');
        form.querySelector('#title').focus();
        return false;
    }
    
    if (!author) {
        alert('작성자를 입력해주세요.');
        form.querySelector('#author').focus();
        return false;
    }
    
    if (!content) {
        alert('내용을 입력해주세요.');
        form.querySelector('#content').focus();
        return false;
    }
    
    return true;
}

// 파일 업로드 유효성 검사
function validateFiles(fileInput) {
    const files = fileInput.files;
    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 5;
    
    if (files.length > maxFiles) {
        alert(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
        fileInput.value = '';
        return false;
    }
    
    for (let i = 0; i < files.length; i++) {
        if (files[i].size > maxSize) {
            alert(`파일 크기는 5MB를 초과할 수 없습니다. (${files[i].name})`);
            fileInput.value = '';
            return false;
        }
    }
    
    return true;
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 파일 입력 유효성 검사
    const fileInput = document.querySelector('#files');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            validateFiles(this);
        });
    }
    
    // 테이블 행 클릭 이벤트 (모바일에서 더 나은 UX)
    const tableRows = document.querySelectorAll('tr[onclick]');
    tableRows.forEach(row => {
        row.addEventListener('click', function() {
            const href = this.getAttribute('onclick').match(/location\.href='([^']+)'/);
            if (href) {
                window.location.href = href[1];
            }
        });
    });
});