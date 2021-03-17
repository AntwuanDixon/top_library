
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
const toggleStorageBtn = document.querySelector('.toggle-switch')
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
    // create book container
    var bookContainer = document.createElement("div");
    bookContainer.className = "book-container";
    bookContainer.dataset.id = index;
    libraryContainer.prepend(bookContainer);

    //Add containers, title, author, delete btn to card
    var bookCard = DOMModule.addBookAttCont();
    var bookTitle = DOMModule.addBookTitleCont(book);
    var bookAuthor = DOMModule.addBookAuthorCont(book);
    var deleteBtn = DOMModule.addDeleteBtn();
    
    bookContainer.appendChild(bookCard);
    bookCard.appendChild(bookTitle);
    bookCard.appendChild(bookAuthor);
    bookContainer.appendChild(deleteBtn);

    if (book.coverURL !== undefined) {
        console.log('has cover')
        createBookCover(bookContainer, book)
    } else {
        console.log('no has cover')
        var bookWithCover = fetchSearchResults (book, bookContainer, index)
        bookWithCover.then(function (result) {
        libraryArr.splice(index, 1, result);
        localStorage.setItem('libraryArr', JSON.stringify(libraryArr))
    })
    }

    deleteBtn.addEventListener('click', function (event) {
        libraryArr = fetchLocalLib();
        var bookID = parseInt(event.target.parentNode.dataset.id);
        bookContainer.remove();
        libraryArr.splice(bookID, 1);
        localStorage.setItem('libraryArr', JSON.stringify(libraryArr))
        DOMModule.refactorLibrary();
    })

    bookCard.addEventListener('click', function (event) {
        DOMModule.refactorLibrary();
        
        libraryArr.forEach(function (storedBook) {
            storedBook.selected = false;
        })
        // refactor containers to display sidebar
        DOMModule.expandSideBar();
        bookForm.classList.add('out');
        bookForm.classList.remove('in');
        updateBtn.style.display = 'block';
        submitBtn.style.display = 'none';

        // set id of selected book based on which element user clicked
        if (event.target.dataset.id !== undefined) {
            id = event.target.dataset.id;
        } else if (event.target.parentNode.dataset.id !== undefined) {
            id = event.target.parentNode.dataset.id;
        } else if (event.target.parentNode.parentNode.dataset.id !== undefined) {
            id = event.target.parentNode.parentNode.dataset.id;
        } else if (event.target.parentNode.parentNode.parentNode.dataset.id !== undefined) {
            id = event.target.parentNode.parentNode.parentNode.dataset.id;
        }  else {
            console.log('could not access container')
        }

        libraryArr[id].selected = true;

        // add selected book card info to input fields
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
    // identify selected book to update
    for (var i = 0; i < allBookContainers.length; i++) {
        if (allBookContainers[i].dataset.id == selectedBookObjID) {
            var selectedBookCont = allBookContainers[i];
        }
    }
    var selectedBookObj = libraryArr[selectedBookObjID]
    // remove attributes of selected book card
    while (selectedBookCont.childNodes[0].firstChild) {
        selectedBookCont.childNodes[0].removeChild(selectedBookCont.childNodes[0].lastChild)
    }
    //update selected book object with field values
    selectedBookObj.title = bookTitleInput.value;
    selectedBookObj.author = bookAuthorInput.value;
    selectedBookObj.pages = bookPagesInput.value;
    selectedBookObj.read = bookReadInput.checked;
    // create new book attributes on selected book card
    var bookTitleCont = DOMModule.addBookTitleCont(selectedBookObj);
    var bookAuthorCont = DOMModule.addBookAuthorCont(selectedBookObj);
    selectedBookCont.childNodes[0].appendChild(bookTitleCont);
    selectedBookCont.childNodes[0].appendChild(bookAuthorCont);
    selectedBookCont.childNodes[0].childNodes[0].innerHTML = selectedBookObj.title;
    selectedBookCont.childNodes[0].childNodes[1].innerHTML = selectedBookObj.author;

    var bookWithCover = fetchSearchResults (selectedBookObj, selectedBookCont, selectedBookObjID)
    bookWithCover.then(function (result) {
        libraryArr.splice(selectedBookObjID, 1, result);
        localStorage.setItem('libraryArr', JSON.stringify(libraryArr))
    })

    DOMModule.refactorLibrary();

    libraryArr[selectedBookObjID] = selectedBookObj;
    localStorage.setItem('libraryArr', JSON.stringify(libraryArr))

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
    // attribute field values to new book variables
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
// make example book upon beginning new session
if (libraryArr === null) {
    libraryArr = [];
    var exampleBookCover = 'https://covers.openlibrary.org/b/id/9008770-L.jpg'
    var exampleBook = new Book('The Art of War', 'Sun Tsu', 68, true, exampleBookCover)
    libraryArr.push(exampleBook)
    localStorage.setItem('libraryArr', JSON.stringify(libraryArr))   
}

loadLibFromStorage (libraryArr)

function loadLibFromStorage (libraryArr) {
    for (let i = 0; i < libraryArr.length; i++) {
        makeNewBookContainer(libraryArr[i], i)
    }
}

function Book(title, author, pages, read, state, coverURL) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.read = read;
    this.selected = state;
    this.coverURL = coverURL;
}

function fetchLocalLib () {
    var library = localStorage.getItem('libraryArr');
    var libraryArrParsed = JSON.parse(library);
    return libraryArrParsed;
}

// fetch book cover from open library API

function fetchSearchResults (book, bookContainer, index) {
    console.log(book)
    fetch("https://openlibrary.org/search.json?q="+book.title)
        .then(resolve => resolve.json())
        .then(response => {

            var bookArr = checkBookTitle(response, book);
            if (bookArr) {
                return bookArr;
            } else {
                console.log('no matches found');
            }
            
        })
        .then(response => {
            var booksWithCoverURLs = createCoverURL(response);

            if (booksWithCoverURLs != undefined) {
                var coverURL = booksWithCoverURLs[0].coverURL;
                book.coverURL = coverURL;

                libraryArr = fetchLocalLib();
                libraryArr[index] = book;
                createBookCover(bookContainer, book)
                localStorage.setItem('libraryArr', JSON.stringify(libraryArr))
            } else {
                console.log('no book cover URLs')
            }
            return book
        })
        return Promise.resolve(book).then((value) => {return value})
}

function createBookCover (bookContainer, book) {
    //bookContainer.removeChild(bookContainer.childNodes[0]);

    while (bookContainer.childNodes[0].firstChild) {
        bookContainer.childNodes[0].removeChild(bookContainer.childNodes[0].lastChild)
    }

    var bookCoverDiv = document.createElement("div");
    bookCoverDiv.className = "book-cover-container";
    var newBookCover = document.createElement('img');
    newBookCover.className = 'book-cover'; 
    newBookCover.src = book.coverURL;
    bookContainer.childNodes[0].appendChild(bookCoverDiv);
    bookContainer.childNodes[0].classList.add('no-border')
    bookCoverDiv.appendChild(newBookCover);
}

function createCoverURL(booksWithCovers) {
    console.log(booksWithCovers[0])
    if (booksWithCovers[0] != undefined) {
        var booksWithCoverURLs = booksWithCovers.map(function (book) {
            var coverID = book.cover_i
            var coverURL = "https://covers.openlibrary.org/b/id/" + coverID + "-L.jpg";
            book.coverURL = coverURL;
            return book;
        })
        return booksWithCoverURLs;
    }
}

function checkBookTitle (response, book) {
    var matchingTitles = response.docs.filter(function (response) {

        var bookTitleResponseNoCaps = response.title.toLowerCase();
        var bookTitleInputNoCaps = book.title.toLowerCase();

        if (bookTitleResponseNoCaps.includes(bookTitleInputNoCaps)) {
                return true;
            } else {
               return false;
            }
    })
    if (matchingTitles) {
        return checkAuthorName(matchingTitles, book.author)
    } else {
        console.log('no matching titles')
        return false;
    }
}

function checkAuthorName (bookArr, author) {
    var authorNoCaps = [];
    var matchingAuthors = bookArr.filter(function (book) {
        var authorInputNoCaps = author.toLowerCase()

        if (book.author_name) {
            authorNoCaps = book.author_name.map(function (authorName) {   
                return authorName.toLowerCase()
            })
        }

        if (book.author_alternative_name) {
            var authorAltsArrNoCaps = book.author_alternative_name.map(function (thisAuthor) {
                return thisAuthor.toLowerCase()
            })
            authorNoCaps.concat(authorAltsArrNoCaps);
        }
        
        if (authorNoCaps.includes(authorInputNoCaps)) {
            return true;
        } else {
            return false;
        }
    })
    
    if (matchingAuthors) {
        return checkIfHasCover(matchingAuthors);
    } else {
        return bookArr;
    }
    
}

function checkIfHasCover (bookArr) {
    var booksWithCovers = bookArr.filter(function (book) {
        if (book.cover_i) {
            return true
        }
    })
    if (booksWithCovers) {
        return booksWithCovers;
    } else {
        return bookArr;
    } 
}