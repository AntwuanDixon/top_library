const libraryContainer = document.querySelector('.library-container');
const bookAuthorInput = document.querySelector('#book-author');
const bookTitleInput = document.querySelector('#book-title');
const bookPagesInput = document.querySelector('#book-pages');
const bookReadInput = document.querySelector('#book-read');
const newBookBtn = document.querySelector('.new-book-btn');
const submitBtn = document.querySelector('.submit-book');
const updateBtn = document.querySelector('.update-btn');
const nukeBtn = document.querySelector('.nuke-library-btn')
const bookForm = document.querySelector('.book-form');
const sideBar = document.querySelector('.side-panel');
var id;
var libraryArr = fetchLocalLib();

var DOMModule = (function () {
    return {
        addBookAttCont: function () {
            var newBookDiv = document.createElement('div');
            newBookDiv.className = "book-attribute-container";
            return newBookDiv;
        },
        
        addBookTitleCont: function (book) {
            var bookTitle = document.createElement('p');
            bookTitle.className = 'title';
            bookTitle.innerHTML = book.title;
            return bookTitle;
        },
        
        addBookAuthorCont: function (book) {
            var bookAuthor = document.createElement('p');
            bookAuthor.className = 'author';
            bookAuthor.innerHTML = book.author;
            return bookAuthor;
        },
        
        addDeleteBtn: function () {
            var deleteBtn = document.createElement('button');
            deleteBtn.className = "delete-btn";
            deleteBtn.innerHTML = "x";
            return deleteBtn;
        },
        
        expandSideBar: function() {
            const bookCards = document.querySelectorAll('.book-container');
            libraryContainer.classList.add('shrink');
            libraryContainer.classList.remove('grow');
            
            bookCards.forEach((card) => {
                card.classList.add('shrink')
                card.classList.remove('grow');
            })
            sideBar.classList.add('out');
            sideBar.classList.remove('in');
        
        },
        
        clearInputFields: function () {
            bookTitleInput.value = ''
            bookAuthorInput.value = ''
            bookPagesInput.value = ''
            bookReadInput.checked = ''
        },
        
        refactorLibrary: function () {
            libraryArr = fetchLocalLib();
            const allBookContainers = document.querySelectorAll('.book-container')
            allBookContainers.forEach(function (book, index) {
                book.dataset.id = (libraryArr.length - 1) - index;
            })
        },
        
        foldSideBar: function() {
            const bookCards = document.querySelectorAll('.book-container');
            libraryContainer.classList.remove('shrink');
            libraryContainer.classList.add('grow');
            bookCards.forEach((card) => {
                card.classList.remove('shrink');
                card.classList.add('grow');
                })
            bookForm.classList.add('in');
            sideBar.classList.add('in');
        }
    };
})();

const makeNewBookContainer = function (book, index) {
    var bookContainer = document.createElement("div");
    bookContainer.className = "book-container";
    bookContainer.dataset.id = index;

    libraryContainer.prepend(bookContainer);
    
    var newBookDiv = DOMModule.addBookAttCont();
    var bookTitle = DOMModule.addBookTitleCont(book);
    var bookAuthor = DOMModule.addBookAuthorCont(book);
    var deleteBtn = DOMModule.addDeleteBtn();
    
    bookContainer.appendChild(newBookDiv);
    newBookDiv.appendChild(bookTitle);
    newBookDiv.appendChild(bookAuthor);
    bookContainer.appendChild(deleteBtn);

    deleteBtn.addEventListener('click', function (event) {
        libraryArr = fetchLocalLib();
        var bookID = parseInt(event.target.parentNode.dataset.id);
        bookContainer.remove();
        libraryArr.splice(bookID, 1);
        localStorage.setItem('libraryArr', JSON.stringify(libraryArr))
        DOMModule.refactorLibrary();
    })

    newBookDiv.addEventListener('click', function (event) {
        DOMModule.refactorLibrary();
        
        libraryArr.forEach(function (storedBook) {
            storedBook.selected = false;
        })

        DOMModule.expandSideBar();
        
        bookForm.classList.add('out');
        bookForm.classList.remove('in');

        updateBtn.style.display = 'block';
        submitBtn.style.display = 'none';

        if (event.target.dataset.id !== undefined) {
            id = event.target.dataset.id;
        } else if (event.target.parentNode.dataset.id !== undefined) {
            id = event.target.parentNode.dataset.id;
        } else if (event.target.parentNode.parentNode.dataset.id !== undefined) {
            id = event.target.parentNode.parentNode.dataset.id;
        } else {
            console.log('could not access container')
        }

        libraryArr[id].selected = true;

        bookTitleInput.value = libraryArr[id].title;
        bookAuthorInput.value = libraryArr[id].author;
        bookPagesInput.value = libraryArr[id].pages;
        bookReadInput.checked = libraryArr[id].read;
    
        localStorage.setItem('libraryArr', JSON.stringify(libraryArr))
    })
};

updateBtn.addEventListener('click', function () {
    libraryArr = fetchLocalLib();

    var selectedBookObjID = libraryArr.map(function (e) {
        return e.selected;
    }).indexOf(true)

    var allBookContainers = document.querySelectorAll('.book-container')

    for (var i = 0; i < allBookContainers.length; i++) {
        if (allBookContainers[i].dataset.id == selectedBookObjID) {
            var selectedBookCont = allBookContainers[i];
        }
    }
    var selectedBookObj = libraryArr[selectedBookObjID]

    while (selectedBookCont.childNodes[0].firstChild) {
        selectedBookCont.childNodes[0].removeChild(selectedBookCont.childNodes[0].lastChild)
    }

    selectedBookObj.title = bookTitleInput.value;
    selectedBookObj.author = bookAuthorInput.value;
    selectedBookObj.pages = bookPagesInput.value;
    selectedBookObj.read = bookReadInput.checked;

    var bookTitleCont = DOMModule.addBookTitleCont(selectedBookObj);
    var bookAuthorCont = DOMModule.addBookAuthorCont(selectedBookObj);
    selectedBookCont.childNodes[0].appendChild(bookTitleCont);
    selectedBookCont.childNodes[0].appendChild(bookAuthorCont);

    DOMModule.refactorLibrary();

    libraryArr[selectedBookObjID] = selectedBookObj;
    localStorage.setItem('libraryArr', JSON.stringify(libraryArr))

    selectedBookCont.childNodes[0].childNodes[0].innerHTML = selectedBookObj.title;
    selectedBookCont.childNodes[0].childNodes[1].innerHTML = selectedBookObj.author;

    DOMModule.foldSideBar();
})  

newBookBtn.addEventListener('click', function () {
    DOMModule.clearInputFields();
    updateBtn.style.display = 'none';
    submitBtn.style.display = 'block';
    DOMModule.expandSideBar();
    bookForm.classList.add('out');
    bookForm.classList.remove('in');
})

nukeBtn.addEventListener('click', function () {
    libraryArr = fetchLocalLib();
    libraryArr.splice(0, libraryArr.length);
    localStorage.setItem('libraryArr', JSON.stringify(libraryArr))
    const allBookContainers = document.querySelectorAll('.book-container');
    allBookContainers.forEach(function (book) {
        book.remove();
    })
})

submitBtn.addEventListener('click', function () {

    const bookTitle = bookTitleInput.value;
    const bookAuthor = bookAuthorInput.value;
    const bookPages = bookPagesInput.value;
    const bookRead = bookReadInput.checked;

    const newBook = new Book(bookTitle, bookAuthor, bookPages, bookRead, false);
    libraryArr = fetchLocalLib();
    var i = libraryArr.length;
    libraryArr.push(newBook);
    localStorage.setItem('libraryArr', JSON.stringify(libraryArr))
    makeNewBookContainer(newBook, i);

    DOMModule.foldSideBar();

    let bookInputs = document.querySelectorAll('.book-input');
    bookInputs.forEach((input) => {
        input.value = '';
    })
});

if (libraryArr === null) {
    libraryArr = [];
    var exampleBook = new Book('The Art of War', 'Sun Tsu', 68, true)
    libraryArr.push(exampleBook)
    localStorage.setItem('libraryArr', JSON.stringify(libraryArr))   
}

loadLibFromStorage (libraryArr)

function loadLibFromStorage (libraryArr) {
    for (let i = 0; i < libraryArr.length; i++) {
        makeNewBookContainer(libraryArr[i], i)
    }
}

function Book(title, author, pages, read, state) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.read = read;
    this.selected = state;
    this.coverURL;
}

function fetchLocalLib () {
    var library = localStorage.getItem('libraryArr');
    var libraryArrParsed = JSON.parse(library);
    return libraryArrParsed;
}
