let cl = console.log;

const postContainer = document.getElementById("postContainer");
const postForm = document.getElementById("postForm");
const titleControl = document.getElementById("title");
const bodyControl = document.getElementById("body");
const userIdControl = document.getElementById("userId");
const addBtn = document.getElementById("addBtn");
const updateBtn = document.getElementById("updateBtn");
const loader = document.getElementById("loader");


let baseUrl = `https://jsonplaceholder.typicode.com`

let postUrl = `${baseUrl}/posts`

let postArr = [];

const createPostedObj = (eve) => {
  eve.preventDefault()
    let createdObj = {
        title : titleControl.value,
        body : bodyControl.value,
        userId : userIdControl.value
    }
    cl(createdObj)
    postForm.reset()

    Swal.fire({
      title: "New post created successfully",
      icon: "success"
    });

    makeApiCall("POST", postUrl, createdObj);
}

postForm.addEventListener("submit", createPostedObj)

const onEdit = (ele) => {
    let EditId = ele.closest(".card").id;
    // cl(EditId)

    localStorage.setItem("editID", EditId)
    postForm.reset()

    let EditUrl = `${postUrl}/${EditId}`

    makeApiCall("GET", EditUrl)
}

const onUpdatePost = () => {
    let updatedObj = {
       title : titleControl.value,
       body : bodyControl.value,
       userId : userIdControl.value
    }
    cl(updatedObj)

    let updateId = localStorage.getItem("editID")
    // cl(updateId)

    let updateUrl = `${postUrl}/${updateId}`

    makeApiCall("PATCH", updateUrl, updatedObj)
}

updateBtn.addEventListener("click", onUpdatePost)


const onDelete = (ele) => {
    let deletedId = ele.closest(".card").id;
    cl(deletedId)
    localStorage.setItem("deleteID", deletedId);
    let deletedUrl = `${postUrl}/${deletedId}`;
  
    makeApiCall("DELETE", deletedUrl)
}


const templatingOfPost = (arr) => {
    let result = ``;
    arr.forEach(post => {
        result += ` <div class="card mb-4 bg2" id="${post.id}">
                      <div class="card-header color">
                        <h2>${post.title}</h2>
                      </div>  
                      <div class="card-body color">
                        <p>${post.body}</p>
                      </div>
                      <div class="card-footer d-flex justify-content-between color">
                        <button class="btn btn-outline-primary" onClick="onEdit(this)">Edit</button>
                        <button class="btn btn-outline-danger" onClick="onDelete(this)">Delete</button>
                      </div>
                    </div>
                        `
    });
    postContainer.innerHTML = result;
}


const makeApiCall = (methodName, apiUrl, bodyMsg = null) => {
    loader.classList.remove("d-none")
    let xhr = new XMLHttpRequest();
    // xhr.open("GET", postUrl)
    xhr.open(methodName, apiUrl)

    xhr.send(JSON.stringify(bodyMsg))

    xhr.onload = function () {
        if (xhr.status >= 200 || xhr.status <= 299 && xhr.readyState === 4) {
            // cl(xhr.response)
            // templating
            loader.classList.add("d-none")
            if (methodName === "GET") {
              // here data may be Array or it may be object
                let data = JSON.parse(xhr.response)
                // cl(data)
                if (Array.isArray(data)) {
                  templatingOfPost(data)
                } else {
                  updateBtn.classList.remove("d-none");
                  addBtn.classList.add("d-none");

                  titleControl.value = data.title;
                  bodyControl.value = data.body;
                  userIdControl.value = data.userId;

                }

            } else if (methodName === "PATCH") {
               cl(xhr.response)
               let responseId = JSON.parse(xhr.response).id; // get single objects Id
               let cardId = document.getElementById(responseId) // edited card Id
               cl(cardId)
               let spredArr = [...cardId.children]; // cardId childrens converted into Array
              //  cl(spredArr)

               spredArr[0].innerHTML = `<h2>${bodyMsg.title}</h2>` // set values as innerHTML
               spredArr[1].innerHTML = `<p>${bodyMsg.body}</p>`
               
               Swal.fire({
                position: "center",
                icon: "success",
                title: "Your work has been saved",
                showConfirmButton: false,
                timer: 1500
              });

               postForm.reset()
               updateBtn.classList.add("d-none");
               addBtn.classList.remove("d-none");

            } else if (methodName === 'DELETE') {
               let deleteID = localStorage.getItem("deleteID");

               Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!"
              }).then((result) => {
                if (result.isConfirmed) {
                  Swal.fire({
                    title: "Deleted!",
                    text: "Your file has been deleted.",
                    icon: "success"
                  });
                let deleteId = document.getElementById(deleteID);
                deleteId.remove(); // remove from UI and DataBase    
                }
              });
  
            } else if (methodName === "POST") {
               let card = document.createElement("div");
               card.className = "card mb-4 bg2";
               let postId = JSON.parse(xhr.response);
              //  cl(postId)
               card.id = postId.id;
               card.innerHTML = ` <div class="card-header">
                                   <h2>${bodyMsg.title}</h2>
                                 </div>  
                                 <div class="card-body">
                                   <p>${bodyMsg.body}</p>
                                 </div>
                                 <div class="card-footer d-flex justify-content-between">
                                   <button class="btn btn-outline-primary" onClick="onEdit(this)">Edit</button>
                                   <button class="btn btn-outline-danger" onClick="onDelete(this)">Delete</button>
                                 </div>
                                  `
              postContainer.append(card) 
            }
        }
    }
}

makeApiCall("GET", postUrl)


// xhr.readystate  >>  0 to 4

// 0 >> XHR Object is created but open method is not called yet
// 1 >> Open method is called
// 2 >> send method is called
// 3 >> server is working on your request
// 4 >> the API call is completed (It may be successs(data) or It may be fail(error))

