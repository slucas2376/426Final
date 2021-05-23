axios.defaults.withCredentials = true;

$( async function () {

  // retriving user id of logged in user
  let uid = localStorage.getItem('uid');
  
  //getting entire user object of current user
  const result = await getUser(uid);
  $(`.name-here`).append(`Welcome ${result.displayName}`)
  // rendering the main feed
  await renderMainFeed();

  //calling renderProfile to render current user's profileS

  //await renderProfile(result.id);
  logoutButton()
});

// does this need to be async? idk really, if it doesn't have to be then probably best to make it sync
async function renderProfile(id) {
  // takes an input user ID and generates a new column with their profile and buttons to display their posted tweets, likes, and retweets
  // needs to add a column remove button at some point; when you work out formatting the handler is in there, just needs a button to attach to
  let user = await getUser(id);
  // user will be empty object if no such registered user exists
  if (user == {}) {console.log("profile retrieval failed"); return;}
  if (document.getElementById(`${user.id}-profile`) != null) {
      // if there's already an element for that user's profile, remove it and make a new one I guess?
      $(document.getElementById(`${user.id}-profile`)).remove();
  }
  $('.columns').append(`
      <div class="column ${user.id}-profile" id="${user.id}-profile">
          <div class="box">
              <div class="user_profile">
                <h2 class="subtitle">Username: ${user.id}</h2>
                <h2 class="subtitle">Display Name: ${user.displayName}</h2>
                <h2 class="subtitle">Description: ${user.profileDescription}</h2>
                <button class="is-button is-info" id="${user.id}-posted">View Posted Tweets</button>
                <button class="is-button is-info" id="${user.id}-liked">View Liked Tweets</button>
                <button class="is-button is-info" id="${user.id}-retweeted">View Retweets</button>
              </div>
          </div>
          <div class="${user.id}-tweets" id="${user.id}-tweets"></div>
      </div>
  `)

  console.log("working as intended");

  // view button handlers
  $(document.getElementById(`${user.id}-posted`)).on('click', () => {
      let tweetsToAdd = getUsersTweets(user.id, "posts")
      $(document.getElementById(`${user.id}-tweets`)).empty();
      for (let t in tweetsToAdd) {
      renderTweetBody(t, `${user.id}-tweets`)
      }
  })
  $(document.getElementById(`${user.id}-liked`)).on('click', () => {
      let tweetsToAdd = getUsersTweets(user.id, "likes")
      $(document.getElementById(`${user.id}-tweets`)).empty();
      for (let t in tweetsToAdd) {
          renderTweetBody(t, `${user.id}-tweets`)
      }
  })
  $(document.getElementById(`${user.id}-retweeted`)).on('click', () => {
      let tweetsToAdd = getUsersTweets(user.id, "retweets")// array of relevant tweets, most recent first, so just add by iterating through it
      $(document.getElementById(`${user.id}-tweets`)).empty();
      // if this for loop syntax doesn't work just rewrite it as the long one I guess? or figure out the rendering issue
      for (let t of tweetsToAdd) {
          renderTweetBody(t, `${user.id}-tweets`)
      }
  })
  /*// column delete button handler; replace `${user.id}-profile-remove` with whatever the column delete button is actually being called
  // (and make sure it's in an id field, or that you use the get by class functionality instead of get by ID)
  $(document.getElementById(`${user.id}-profile-remove`)).on('click', () => {
      $(document.getElementById(`${user.id}-profile`)).remove();
  })*/
}

// autocomplete user search code; if this messes up the on-document-loading code then probably port it up there with whatever syntax changes are necessary
// I *think* the autocomplete db will dynamically update as the backend does? idk though
$(document).ready(function() {
  const backend = 'https://api.426twitter20.com'
  let ac = new Autocomplete(document.getElementById('autocomplete'), {
      search: input => {
          const url = `${backend}/users/idnames/${input}`
          return new Promise(resolve => {
              if (input.length < 1) {
                  return resolve([])
              }
              fetch(url)
                  .then(response => response.json())
                  .then(data => {
                      resolve(data);
                  })
          })
      },
      getResultValue: result => (result.displayName + " @" + result.userId),
      onSubmit: result => {
          // whatever goes here will execute when the user presses enter or clicks the autocomplete option; if you don't want that, then add a submit button and handlers and stuff
          renderProfile(id);
      },
      debounceTime: 300
  });
});


async function getUsersTweets(userId, type) {
  const result = await axios.get(`https://api.426twitter20.com/tweets/user/${type}/${userId}`);
  return result.data;
}

async function getUserLikes(userId) {
  const result = await axios.get(`https://api.426twitter20.com/tweets/user/likes/${userId}`)
  return result.data;
}


async function viewUserProfile(user) {
  ('.userProfile').on('click', async(e) => {
    await renderUserProfile(user);
  });
}

//Javascript function to render the users own profile. Comes with edit buttons and the ability to manipulate your profile.
async function renderUserProfile(user) {
    console.log(user);
    $('.columns').append(`
    <div class="column edit-${user.id}">
        <div class="box">
            <div class="user_profile">
            <h2 class="subtitle">Username: ${user.id}</h2>
            <h2 class="subtitle">Display Name: ${user.displayName}</h2>
            <h2 class="subtitle">Description: ${user.profileDescription}</h2>
            <button type="submit" class="user_edit_button is-button is-info">Edit User</button>
            <button type="submit" class="user_delete_button is-button is-danger">Delete User</button>
            </div>
        </div>
    </div>
    `);

    //click handler for edit button
    $(`.user_edit_button`).on('click', async(e) => {
        let form = `
        <form class="fillout box">
                <div class="field">
                    <label class="label  has-text-centered">Edit your profile!</label>
                    <label class="label">Display Name</label>
                    <div class="control">
                      <textarea class="textarea display-name small" placeholder="${user.displayName}" form=".fillout box"></textarea>
                      <input type = "submit">
                    </div>
                </div>
    
                <div class="field">
                    <div class="control">
                        <label class="label">Password</label>
                        <textarea class="textarea new-password small" placeholder="${user.password}" form=".fillout box"></textarea>
                        <input type = "submit">
                    </div>
                </div>

                <div class="field">
                  <div class="control">
                      <label class="label">Profile Avatar</label>
                      <textarea class="textarea new-avatar small" placeholder="${user.avatar}" form=".fillout box"></textarea>
                      <input type = "submit">
                  </div>
                </div>
                <div class="field">
                  <div class="control">
                    <label class="label">Profile Description</label>
                    <textarea class="textarea new-description small" placeholder="${user.profileDescription}" form=".fillout box"></textarea>
                    <input type = "submit">
                  </div>
                </div>
                <div class="field is-grouped is-grouped-centered">
                    <p class="control">
                        <a id="Save-Changes" class="button is-info">
                            Save Changes
                        </a>
                    </p>
                    <p class="control">
                        <a id="cancelled" class="button is-danger">
                            Cancel
                        </a>
                    </p>
                    <p class="control">
                        <a id="delete-profile" class="button is-info">
                            Delete profile
                        </a>
                    </p>
                </div>
            </form>`;

        $(`.user_profile`).replaceWith(form);

        $(`.fillout box`).on('submit', async(e) => {
            let updatedDisplayName = $(`.display-name`).val();
            let updatedPassword = $(`.new-password`).val();
            let updatedAvatar = $(`.new-avatar`).val();
            let updatedProfileDescription = $(`.new-description`).val();

            if (updatedDisplayName == "") {
                updatedDisplayName = user.displayName;
            }

            if (updatedPassword == "") {
                updatedPassword = user.password;
            }

            if (updatedAvatar == "") {
                updatedAvatar = user.avatar;
            }

            //axios request
            const result = await axios({
                method: 'put',
                url: 'https://api.426twitter20.com/users/' + user.id,
                withCredentials: true,
                data: {
                    "displayName": updatedDisplayName,
                    "password": updatedPassword,
                    "avatar": updatedAvatar,
                    "profileDescription": updatedProfileDescription
                },
            });

            $(`.edit-${user.id}`).remove();

            //get new user object
            const user2 = await axios({
                method: 'get',
                url: 'https://api.426twitter20.com/users/' + user.id,
                withCredentials: true,
            });

            renderUserProfile(user2.data);
        });

        //click handler for cancel button
        $(`#cancelled`).on('click', async(e) => {
            $(`.edit-${user.id}`).remove();

            //get new user object
            const user2 = await axios({
                method: 'get',
                url: 'https://api.426twitter20.com/users/' + user.id,
                withCredentials: true,
            });

            renderUserProfile(user2.data);
        });
    });

    //click handler for delete button
    $(`#delete-profile`).on('click', async(e) => {
        //axios request
        const result = await axios({
            method: 'delete',
            url: 'https://api.426twitter20.com/users/' + user.id,
            withCredentials: true,
        });

        //axios request again
        const result2 = await axios({
            method: 'get',
            url: 'https://api.426twitter20.com/logout',
            withCredentials: true,
        });

        $(`.edit-${user.id}`).remove();
    });
}

async function renderUserData(id, type, element) {
    $(`.${element}`).replaceWith(`<div class="${element}"></div>`);
    
    let user = await getUser(id);
    
    if (type == "liked") {

        for ( let i = 0; i < user.likedTweets.length; i++ ) {
            await renderTweetBody(user.likedTweets, element);
        }

    } else if (type == "retweet") {

        for( let i = 0; i < user.hasRetweeted.length; i++) {
            await renderTweetBody(user.hasRetweeted, element);
        }

    } else if (type == "posted") {

        for ( let i = 0; i < user.postedTweets.length; i++ ) {
            await renderTweetBody(user.postedTweets, element);
        }

    }
}

// still trying to figure out exactly how to provide the "tweet" object. 
async function renderNewTweet(data, element, reply) {
    // awaiting all recent tweets and users personally like tweet ids

    let compare = await getUserLikes(localStorage.getItem('uid'));

    // stored value for if tweet is liked or not
    let bool = false;

    for (let i = 0; i < data.length; i++ ) {

      if (compare != undefined) {
        for (let j = 0; j < compare.length; j++) {
          if (data[i].id == compare[j].id) {
            bool = true;
            break;
          }
        }
      }

      if (data[i] != {}) {
        await renderTweetBody(data[i], element, bool, reply);
      }

      bool = false;
    }
}

async function renderTweetBody(data, element, liked, reply) {
   console.log(data);
    let user = await getUser(data.userId);
 
    if(data.type == "tweet") {
      if(data.mediaType == "image") {
        $(`${element}`).append(`
        <article class="media tweet-${data.id}">
          <br>    
          <div class="box media-content">
              <article class="media">
                <figure class="media-left">
                  <p class="image is-64x64">
                    <img class="is-rounded" src="${user.avatar}">
                  </p>
                </figure>
                <div class="media-content">
                  <div class="content type-${data.userId} clickReply-${data.id}">
                    <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                    <div class="edit-area-${data.id}">
                      ${data.body}
                      <br>
                      <img src="${data.imageLink}">
                    </div>
                  </div>
                  <div class="retweet-reply-${data.id}"></div>
                  <div class="buttons-${data.id}"></div>
                </div>
              </article>
              
            </div>
        </article>
        
        `);
      } else if (data.mediaType == "video") {
        $(`${element}`).append(`
              <article class="media tweet-${data.id}">
                <br>  
                <div class="box media-content">
                    <article class="media">
                      <figure class="media-left">
                        <p class="image is-64x64">
                          <img class="is-rounded" src="${user.avatar}">
                        </p>
                      </figure>
                      <div class="media-content">
                        <div class="content type-${data.userId}">
                          <div class="clickReply-${data.id}">
                            <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                              <div class="edit-area-${data.id}">
                              ${data.body}
                              <br>
                              <figure class="image is-16by9">
                                <iframe class="has-ratio" width="640" height="360" src="https://www.youtube.com/embed/${data.videoId}" frameborder="0" allowfullscreen></iframe>
                              </figure>
                              </div>
                          </div>
                        </div>
                        <div class="retweet-reply-${data.id}"></div>
                        <div class="buttons-${data.id}"></div>
                      </div>
                    </article>
                    
                  </div>
              </article>
            
        
        `);
      } else {
        $(`${element}`).append(`
        <article class="media tweet-${data.id}">
          <br>    
          <div class="box media-content">
              <article class="media">
                <figure class="media-left">
                  <p class="image is-64x64">
                    <img class="is-rounded" src="${user.avatar}">
                  </p>
                </figure>
                <div class="media-content">
                  <div class="content type-${data.userId} clickReply-${data.id}">
                    <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                    <p class="edit-area-${data.id}">
                        ${data.body}
                    </p>
                  </div>
                  <div class="retweet-reply-${data.id}"></div>
                  <div class="buttons-${data.id}"></div>
                </div>
              </article>
              
            </div>
        </article>
        
        `);
      }
        
    } else if (data.type == "retweet") {

        parent = await getTweet(data.parentId);
        let userParent = await getUser(parent.userId);

        if (parent == "Tweet has been deleted.") {
                $(`${element}`).append(`
                    <article class="media tweet-${data.id}">
                      <br>  
                      <div class="box media-content">
                        <article class="media">
                          <figure class="media-left">
                            <p class="image is-64x64">
                              <img class="is-rounded" src="${user.avatar}">
                            </p>
                          </figure>
                          <div class="media-content">
                            <div class="content type-${data.userId} clickReply-${data.id}">
                              <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                              <div class="edit-area-${data.id}">
                              ${data.body}
                              </div>
                              <br>
                              <article class="media">
                                <br>
                                <div class="media-content">
                                  <p> Whoops, this tweet was deleted. Sorry for the inconviencence </p>
                                </div>
                                <br>
                              </article>
                            </div>
                            <div class="retweet-reply-${data.id}"></div>
                            <div class="buttons-${data.id}"></div>
                          </div>
                        </article>
                      </div>
                    </article>
                `);
            } else if ( parent.mediaType == "image" ) {
              $(`${element}`).append(`
                  <article class="media tweet-${data.id}">
                  <br>
                    <div class="box media-content">
                      <article class="media">
                        <figure class="media-left">
                          <p class="image is-64x64">
                            <img class="is-rounded" src="${user.avatar}">
                          </p>
                        </figure>
                        <div class="media-content">
                          <div class="content type-${data.userId}">
                              <div class="clickReply-${data.id}">
                                <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                                <div class="edit-area-${data.id}">
                                  ${data.body}
                                </div>
                                <br>
                              </div>
                              <article class="media">
                                <figure class="media-left">
                                  <p class="image is-64x64">
                                    <img class="is-rounded" src="${userParent.avatar}">
                                  </p>
                                </figure>
                                <div class="media-content">
                                  <div class="content type-${parent.userId}">
                                    <div class="clickReply-${parent.id}">
                                      <strong>${userParent.displayName}</strong> <small>@${parent.userId}</small>
                                      <br>
                                      ${parent.body}
                                      <br>
                                      <img src="${parent.imageLink}">
                                    </div>
                                  </div>
                                </div>
                              </article>
                          </div>
                          <div class="retweet-reply-${data.id}"></div>
                          <div class="buttons-${data.id}"></div>
                        </div>
                      </article>
                      
                    </div>

                  </article>
              `);
            
            } else if( parent.mediaType == "video" ) { 
              $(`${element}`).append(`
                  <article class="media tweet-${data.id}">
                    <br>
                    <div class="box media-content">
                      <article class="media">
                        <figure class="media-left">
                          <p class="image is-64x64">
                            <img class="is-rounded" src="${user.avatar}">
                          </p>
                        </figure>
                        <div class="media-content">
                          <div class="content type-${data.userId} clickReply-${data.id}">
                            <div class="clickReply-${data.id}">
                              <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                              <div class="edit-area-${data.id}">
                                ${data.body}
                              </div>
                              <br>
                              </div>
                              <article class="media">
                                <figure class="media-left">
                                  <p class="image is-64x64">
                                    <img class="is-rounded" src="${userParent.avatar}">
                                  </p>
                                </figure>
                                <div class="media-content">
                                  <div class="content type-${parent.userId} clickReply-${parent.id}">
                                      <strong>${userParent.displayName}</strong> <small>@${parent.userId}</small>
                                      <br>
                                      ${parent.body}
                                      <br>
                                    <figure class="image is-16by9">
                                      <iframe class="has-ratio" width="640" height="360" src="https://www.youtube.com/embed/${parent.videoId}" frameborder="0" allowfullscreen></iframe>
                                    </figure>
                                  </div>
                                </div>
                              </article>
                          </div>
                          <div class="retweet-reply-${data.id}"></div>
                          <div class="buttons-${data.id}"></div>
                        </div>
                      </article>
                      
                    </div>

                  </article>
              `);

            } else {
                $(`${element}`).append(`
                    <article class="media tweet-${data.id}">
                      <br>  
                      <div class="box media-content">
                        <article class="media">
                          <figure class="media-left">
                            <p class="image is-64x64">
                              <img class="is-rounded" src="${user.avatar}">
                            </p>
                          </figure>
                          <div class="media-content">
                            <div class="content type-${data.userId} ">
                                <div class="clickReply-${data.id}">
                                  <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                                  <div class="edit-area-${data.id}">
                                    ${data.body}
                                  </div>
                                  <br>
                                </div>
                                <article class="media">
                                  <figure class="media-left">
                                    <p class="image is-64x64">
                                      <img class="is-rounded" src="${userParent.avatar}">
                                    </p>
                                  </figure>
                                  <div class="media-content">
                                    <div class="content type-${parent.userId} clickReply-${parent.id}">
                                        <strong>${userParent.displayName}</strong> <small>@${parent.userId}</small>
                                        <div>
                                        ${parent.body}
                                        </div>
                                        <br>
                                    </div>
                                  </div>
                                </article>
                            </div>
                            <div class="retweet-reply-${data.id}"></div>
                            <div class="buttons-${data.id}"></div>
                          </div>
                        </article>
                        
                      </div>
                    </article>
                `);
            }
        renderTweetReplys(parent);
    } 
    
    if(!reply){
      if (user.id == localStorage.getItem('uid')) {
        $(`.buttons-${data.id}`).replaceWith(`
          <div class="buttons-${data.id}">
            <button class="button edit-${data.id} is-info is-small">Edit</button>
            <button class="button like-${data.id} is-info is-small">Like</button>
            <button class="button retweet-${data.id} is-info is-small">Retweet: ${data.retweetCount}</button>
            <button class="button reply-${data.id} is-info is-small">Reply: ${data.replyCount}</button>
           <button class="button delete-${data.id} is-danger is-small"> Delete </button>
          </div>
       `);
        
      } else {
        $(`.buttons-${data.id}`).replaceWith(`
          <div class="buttons-${data.id}">
            <button class="button like-${data.id} is-info is-small">Like</button>
            <button class="button retweet-${data.id} is-info is-small">Retweet: ${data.retweetCount}</button>
            <button class="button reply-${data.id} is-info is-small">Reply: ${data.replyCount} </button>
         </div>
       `);    
      }
    }

    like(data, liked);
    editButton(data);
    retweetButton(data);
    replyButton(data);
    deleteButton(data);
    renderTweetReplys(data);

}

function renderTweetReplys(data) {
    // when new tweet bodies of the same id are created the listener is removed and re-applied to all intances
    // avoids major error of placing multiple of the same event listeners
    
    $(`.clickReply-${data.id}`).off();
    // makes it so there won't be multiple of the same listener on the different/same tweets
    $(`.clickReply-${data.id}`).on('click', async () => {

      // a replyfield means no creation of a repliefield can happen
      if ($(`.replyfield-${data.id}`).length == 0) {
      
        let replys = await getReplies(data.id);
        // initializing the new tweet and reply column
        // Later there will be a close button to delete the column completely and reinstantiate the reply event listener for the tweet body
        $('.columns').append(
          `<div class="column replyfield-${data.id}">
            <div class="box has-background-info tweetReply-${data.id}">
            <article class="message">
              <div class="message-header">
                Replies to ${data.userId}'s Tweet
                <button class="delete deleteReply-${data.id}"></button>
              </div>
            </article>
            </div>
          </div>`
        );
    
        $(`.deleteReply-${data.id}`).on('click', async () => {
          $(`.replyfield-${data.id}`).remove();
          await renderTweetReplys(data);
        });
  
        await renderNewTweet([data], `.tweetReply-${data.id}`, true);
  
        // turns off click event listener for tweet body to avoid creating tons of reply columns
        $(`.clickReply-${data.id}`).off();
  
        // no replys gives basic "no replies" message
        if (replys.data.length == 0) {
          $(`.tweetReply-${data.id}`).append(`
            <article class="media tweet-${data.id}">
              <div class="box media-content">
                <article class="media">
                  <figure class="media-left">
                    <h1 class="has-text-centered"> No replys </h1>
                  </figure>
                </article>
              </div>
            </article>
          `)
        }   
        // renders the new replies similar to the main twitter feed.
        // uses the abstraction of the renderNewTweet function to accomplish this
        await renderNewTweet(replys.data, `.tweetReply-${data.id}`, false)
      }
    }); 
}

async function renderMainFeed() {
    $(`.columns`).append(`
        <div class="column mainfeed">
            <div class="title has-text-centered">
              Whats Happening!
            </div>
            <div class="box has-background-info feed">
                <form class="level" id="newTweet">
                    <button class="button is-primary tweet">Tweet</button>
                </form>
            </div>
        </div>
    `);

    tweetButton();

    let data = await recentTweets();
    
    await renderNewTweet(data, ".feed", false);

}

function editButton(data) {

  $(`.edit-${data.id}`).on('click', () => {

    if (data.mediaType == "video") {
      $(`.edit-area-${data.id}`).replaceWith(`
      <div class="edit-area-${data.id}">
        <div class="field">
          <div class="contianer">
            <p> Main Body </p>
            <textarea class="replace-${data.id}"> ${data.body} </textarea>
            <p> Video Link </p>
            <textarea class="replace-video-${data.id}"> https://www.youtube.com/watch?v=${data.videoId} </textarea>
          </div>
        </div>
        <div class="edit-buttons-${data.id}">
          <button class="button submit-edit-${data.id} is-info is-small" type="button">Submit Edit</button>
          <button class="button cancel-edit-${data.id} is-danger is-small" type="button"> Cancel </button>
        </div>
      </div>
      `);
    } else if (data.mediaType == "image") {
      $(`.edit-area-${data.id}`).replaceWith(`
      <div class="edit-area-${data.id}">
        <div class="field">
          <div class="contianer">
            <p> Main Body </p>
            <textarea class="replace-${data.id}"> ${data.body} </textarea>
            <p> Image Link </p>
            <textarea class="replace-image-${data.id}"> ${data.imageLink} </textarea>
            </div>
        </div>
        <div class="edit-buttons-${data.id}">
          <button class="button submit-edit-${data.id} is-info is-small" type="button">Submit Edit</button>
          <button class="button cancel-edit-${data.id} is-danger is-small" type="button"> Cancel </button>
        </div>
      </div>
      `);
    } else {
      $(`.edit-area-${data.id}`).replaceWith(`
      <div class="edit-area-${data.id}">
        <div class="field">
          <div class="contianer">
            <textarea class="replace-${data.id}"> ${data.body} </textarea>
          </div>
        </div>
        <div class="edit-buttons-${data.id}">
          <button class="button submit-edit-${data.id} is-info is-small" type="button">Submit Edit</button>
          <button class="button cancel-edit-${data.id} is-danger is-small" type="button"> Cancel </button>
        </div>
      </div>
    `);
    }


    $(`.edit-${data.id}`).replaceWith(`
      <button class="button edit-${data.id} is-info is-small">edit</button>
    `);

    $(`.submit-edit-${data.id}`).on('click', async () => {
      let final = $(`.replace-${data.id}`).val();

      data.body = final;

      if ( data.mediaType == "image") {
        
        let link = $(`.replace-image-${data.id}`).val();
        
        await edit(data.id, final, "image", link);

        data.imageLink = link

        $(`.edit-area-${data.id}`).replaceWith(`
          <div class="edit-area-${data.id}">
            ${data.body}
            <br>
            <img src="${link}">
          </div>
        `);

      } else if ( data.mediaType == "video") {

        let position = $(`.replace-video-${data.id}`).val().indexOf("watch?v=") + 8;
        let link = $(`.replace-video-${data.id}`).val().substring(position, $(`.replace-video-${data.id}`).val().length);

        await edit(data.id, final, "video", link);
      
        data.videoId = link;

        $(`.edit-area-${data.id}`).replaceWith(`
          <div class="edit-area-${data.id}">
            ${data.body}
            <br>
            <figure class="image is-16by9">
              <iframe class="has-ratio" width="640" height="360" src="https://www.youtube.com/embed/${data.videoId}" frameborder="0" allowfullscreen></iframe>
            </figure>
          </div>
        `);
      
      } else {
        await edit(data.id, final, "none", "");
        $(`.edit-area-${data.id}`).replaceWith(`
          <div class="edit-area-${data.id}">
            ${data.body}
            <br>
          </div>
        `);
        
      }

      editButton(data);
    });

    $(`.cancel-edit-${data.id}`).on('click', () => {

      if ( data.mediaType == "image") {
        $(`.edit-area-${data.id}`).replaceWith(`
          <div class="edit-area-${data.id}">
            ${data.body}
            <br>
            <img src="${data.imageLink}">
          </div>
        `);

      } else if ( data.mediaType == "video") {
        $(`.edit-area-${data.id}`).replaceWith(`
          <div class="edit-area-${data.id}">
            ${data.body}
            <br>
            <figure class="image is-16by9">
              <iframe class="has-ratio" width="640" height="360" src="https://www.youtube.com/embed/${data.videoId}" frameborder="0" allowfullscreen></iframe>
            </figure>
          </div>
        `);
      
      } else {
        $(`.edit-area-${data.id}`).replaceWith(`
          <div class="edit-area-${data.id}">
            ${data.body}
            <br>
          </div>
        `);
      }

      editButton(data);

    })
  });
}

function retweetButton(data) {

  $(`.retweet-${data.id}`).on('click', () => {
    $(`.retweet-reply-${data.id}`).replaceWith(`
      <div class="retweet-reply-${data.id}">
        <div class="field">
          <div class="contianer">
            <textarea class="retweet-body-${data.id}" placeholder="retweet away"></textarea>
          </div>
        </div>
        <div class="retweet-buttons-${data.id}">
          <button class="button retweet-submit-${data.id} is-info is-small" type="button">Submit Retweet</button>
          <button class="button retweet-cancel-${data.id} is-danger is-small" type="button">Cancel</button>
        </div>
      </div>
    `);

    $(`.retweet-${data.id}`).replaceWith(`
      <button class="button retweet-${data.id} is-info is-small">Retweet: ${data.retweetCount}</button>
    `);

    $(`.retweet-submit-${data.id}`).on('click', async () => {
      data.retweetCount += 1;
      let final = $(`.retweet-body-${data.id}`).val();
      console.log(final);

      let retwe = await retweet(data.id, final);
      await renderTweetBody(retwe);
      $(`.retweet-${data.id}`).replaceWith(`
        <button class="button retweet-${data.id} is-info is-small"> Retweet: ${data.retweetCount} </button>
      `)

      $(`retweet-reply-${data.id}`).replaceWith(`
      <div class="retweet-reply-${data.id}"></div>
      `);
      retweetButton(data);
    });


    $(`.retweet-cancel-${data.id}`).on('click', () => {
      $(`.retweet-reply-${data.id}`).replaceWith(`
        <div class="retweet-reply-${data.id}"></div>
      `);
      retweetButton(data);
    });
  })

  
}

function replyButton(data) {
  $(`.reply-${data.id}`).on('click', () => {
    $(`.retweet-reply-${data.id}`).replaceWith(`
      <div class="retweet-reply-${data.id}">
        <div class="field">
          <div class="contianer">
            <textarea class="reply-body-${data.id}" placeholder="reply away"></textarea>
          </div>
        </div>
      <div class="reply-buttons-${data.id}">
        <button class="button reply-submit-${data.id} is-info is-small" type="button">Submit Reply</button>
        <button class="button reply-cancel-${data.id} is-danger is-small" type="button"> Cancel </button>
      </div>
    </div>
    `);

    $(`.reply-${data.id}`).replaceWith(`
      <button class="button reply-${data.id} is-info is-small">Reply: ${data.replyCount}</button>
    `);

    $(`.reply-submit-${data.id}`).on('click', async () => {
      data.replyCount += 1;
      let final = $(`.reply-body-${data.id}`).val();
      await reply(data.id, final);

      $(`.retweet-${data.id}`).replaceWith(`
        <button class="button reply-${data.id} is-info is-small"> Reply: ${data.replyCount} </button>
      `)

      $(`.retweet-reply-${data.id}`).replaceWith(`
        <div class="retweet-reply-${data.id}"></div>
      `);
      replyButton(data);
    });


    $(`.reply-cancel-${data.id}`).on('click', () => {
      $(`.retweet-reply-${data.id}`).replaceWith(`
        <div class="retweet-reply-${data.id}"></div>
      `);
      replyButton(data);
    });
  })
}


function tweetButton() {
  $(`.tweet`).on('click', () => {
      $(`#newTweet`).replaceWith(`
      
          <form class="fillout box" id="newTweet">
              <div class="field">
                  <label class="label  has-text-centered">Make your own Tweet</label>
                  <label class="label">Tweet Body</label>
                  <div class="control">
                      <textarea id="tweetCreation" rows="5" class="input" type="text" placeholder="Say Something"></textarea>
                  </div>
              </div>
              <div class="field image-video">
                  
              </div>
              <div class="field">
                <div class="control checked">
                  <label class="radio">
                    <input id="video" type="radio" name="answer">
                    Youtube Video
                  </label>
                  <label class="radio">
                    <input id="image" type="radio" name="answer">
                      Image
                    </inpu>
                  </label>
                </div>
              </div>
              <div class="field is-grouped is-grouped-centered">
                  <p class="control">
                      <a id="enter" class="button is-info">
                          Send It
                      </a>
                  </p>
                  <p class="control">
                      <a id="begon" class="button is-danger">
                          Another Time
                      </a>
                  </p>
              </div>
          </form>
      `);

      $(`#video`).on(`click`, () => {
        $(`.image-video`).replaceWith(`
          <div class="field image-video">
            <label class="label">Video Link</label>
            <div class="control">
              <input id="link" class="input" type="text" placeholder="full, single video link">
            </div>
          </div>
        `);
      });

      $(`#image`).on('click', () => {
      
        $(`.image-video`).replaceWith(`
          <div class="field image-video">
            <label class="label">Image URL</label>
            <div class="control">
              <input id="link" class="input" type="text" placeholder="image link">
            </div>
          </div>
        `);
      });


      $(`#enter`).on(`click`, async () => {
        if($(`#video`).is(`:checked`) && ($(`#link`).val() != "")) {
          let position = $(`#link`).val().indexOf("watch?v=") + 8;
          let link = $(`#link`).val().substring(position,$(`#link`).val().length);

          let result = await axios.post(`https://api.426twitter20.com/tweets`, 
          {type: "tweet", body: $(`#tweetCreation`).val(), mediaType: "video", mediaId: link, userId: localStorage.getItem('uid')}, {withCredentials: true});

          let user = await getUser(localStorage.getItem('uid'));
          let posts = await getUsersTweets(localStorage.getItem('uid'), "posts");
          result = posts[0];

          $(`.feed`).prepend(`
          <br>
            <article class="media tweet-${result.id}">
                <div class="box media-content">
                  <article class="media">
                    <figure class="media-left">
                      <p class="image is-64x64">
                        <img class="is-rounded" src="${user.avatar}">
                      </p>
                    </figure>
                    <div class="media-content">
                      <div class="content type-${result.userId}">
                      <strong>${user.displayName}</strong> <small>@${user.id}</small>
                        <div class="edit-area-${result.id}">
                          ${result.body}
                          <br>
                        </div>
                        <figure class="image is-16by9">
                          <iframe class="has-ratio" width="640" height="360" src="https://www.youtube.com/embed/${result.videoId}" frameborder="0" allowfullscreen></iframe>
                        </figure>
                      </div>
                      <div class="buttons">
                        <button class="button edit-${result.id} is-info is-small">Edit</button>
                        <button class="button retweet-${result.id} is-info is-small">  Retweet </button>
                        <button class="button reply-${result.id} is-info is-small">  Reply </button>
                        <button class="button delete-${result.id} is-danger is-small"> Delete </button>
                      </div>
                    </div>
                  </article>
                  
                </div>
            </article>
          `);
          $('#newTweet').remove();
          $(`.feed`).prepend(`
            <form class="level" id="newTweet">
              <button class="button is-primary tweet">Tweet</button>
            </form>
          `);

          tweetButton();
          retweetButton(result);
          replyButton(result);
          editButton(result);
          deleteButton(result);

        } else if ($(`#image`).is(`:checked`) && ($(`#link`).val() != "")) {
          
          let result = await axios.post(`https://api.426twitter20.com/tweets`, 
          {type: "tweet", body: $(`#tweetCreation`).val(), mediaType: "image", mediaId: $(`#link`).val(), userId: localStorage.getItem('uid')}, 
          {withCredentials: true});

          let user = await getUser(localStorage.getItem('uid'));
          let posts = await getUsersTweets(localStorage.getItem('uid'), "posts");
          result = posts[0];


          $(`.feed`).prepend(`
          <br>
            <article class="media tweet-${result.id}">
                <div class="box media-content">
                  <article class="media">
                    <figure class="media-left">
                      <p class="image is-64x64">
                        <img class="is-rounded" src="${user.avatar}">
                      </p>
                    </figure>
                    <div class="media-content">
                      <div class="content type-${result.userId}">
                        <strong>${user.displayName}</strong> <small>@${user.id}</small>
                        <div class="edit-area-${result.id}">
                          ${result.body}
                          <br>
                        </div>
                        <figure class="image is-1by1">
                          <img src="${result.imageLink}">
                        </figure>
                      </div>
                      <div class="buttons">
                        <button class="button edit-${result.id} is-info is-small">Edit</button>
                        <button class="button retweet-${result.id} is-info is-small">  Retweet </button>
                        <button class="button reply-${result.id} is-info is-small">  Reply </button>
                        <button class="button delete-${result.id} is-danger is-small"> Delete </button>
                      </div>
                    </div>
                  </article>
                  
                </div>
            </article>
          `);
          $('#newTweet').remove();
          $(`.feed`).prepend(`
            <form class="level" id="newTweet">
              <button class="button is-primary tweet">Tweet</button>
            </form>
          `);

          tweetButton();
          retweetButton(result);
          replyButton(result);
          editButton(result);
          deleteButton(result);

        } else { 
          let result = await tweet($(`#tweetCreation`).val());
          let user = await getUser(localStorage.getItem('uid'));
          let posts = await getUsersTweets(localStorage.getItem('uid'), "posts");
          result = posts[0];

          $(`.feed`).prepend(`
          <br>
            <article class="media tweet-${result.id}">
                <div class="box media-content">
                  <article class="media">
                    <figure class="media-left">
                      <p class="image is-64x64">
                        <img class="is-rounded" src="${user.avatar}">
                      </p>
                    </figure>
                    <div class="media-content">
                      <div class="content type-${result.id}">
                      <strong>${user.displayName}</strong> <small>@${user.id}</small>
                        <div class="edit-area-${result.id}">
                          ${result.body}
                          <br>
                        </div>
                      </div>
                      <div class="buttons">
                        <button class="button edit-${result.id} is-info is-small"> Edit </button>
                        <button class="button retweet-${result.id} is-info is-small"> Retweet </button>
                        <button class="button reply-${result.id} is-info is-small"> Reply </button>
                        <button class="button delete-${result.id} is-danger is-small"> Delete </button>
                      </div>
                    </div>
                  </article>
                  
                </div>
            </article>
          `);

          $('#newTweet').remove();

          $(`.feed`).prepend(`
            <form class="level" id="newTweet">
              <button class="button is-primary tweet">Tweet</button>
            </form>
          `);

          tweetButton();
          retweetButton(result);
          replyButton(result);
          editButton(result);
          deleteButton(result);
        }
      
      });

      // if user cancels tweet creation, tweet button is re-instated
      $(`#begon`).on('click', () => {
        $(`#newTweet`).replaceWith(`
        <form class="level" id="newTweet">
          <button class="button is-primary tweet">Tweet</button>
        </form>`);
        
        tweetButton();
      });
  });
}

function like(data, liked) {

  if(liked) {
      $(`.like-${data.id}`).replaceWith(`<button class="button like-${data.id} is-success is-small">Liked: ${data.likeCount}</button>`)
      
      $(`.like-${data.id}`).on('click', async function() {
          const result = await axios.post(`https://api.426twitter20.com/tweets/${data.id}/like`, {userId: localStorage.getItem('uid'), withCredentials: true});
          data.likeCount -= 1;
          like(data, !(liked)); 
      });
  } else {
      $(`.like-${data.id}`).replaceWith(`<button class="button like-${data.id} is-info is-small">Like: ${data.likeCount}</button>`)
      
      $(`.like-${data.id}`).on('click', async function() {
          const result = await axios.post(`https://api.426twitter20.com/tweets/${data.id}/like`, {userId: localStorage.getItem('uid'), withCredentials: true});
          data.likeCount += 1;
          like(data, !(liked));
      });
  }
}

function deleteButton(data) {
  $(`.delete-${data.id}`).on(`click`, async () => {
    await deleteTweet(data.id);
    // removes base tweet and the associated tweetReply column with it
    $(`.tweet-${data.id}`).remove();
    $(`.tweetReply-${data.id}`).remove();
  });
}

function logoutButton() {
  $(`.logout`).on(`click`, async () => {
    await logout();
    window.location.replace("index.html");
  });
}

function resetPage() {
  $(`#reset-page`).on('click', async () => {
    $(`.column`).remove();

    await renderMainFeed();
  });
}

async function getTweet(id) {
    const result = await axios.get(`https://api.426twitter20.com/tweet/${id}`, {withCredentials: true})
    return result.data;
}

async function logout() {
    const result = await axios.get(`https://api.426twitter20.com/logout`, {withCredentials: true});
}

async function getUser(id) {
    const result = await axios.get(`https://api.426twitter20.com/users/${id}`,
    {}, {withCredentials: true});

    return result.data;
}

async function deleteUser(id) {
    const result = await axios.delete(`https://api.426twitter20.com/users/${id}`, {withCredentials: true});
}

async function editUser(id, name, pass, avat, descript) {
    const result = await axios.put(`https://api.426twitter20.com/users/${id}`, {displayName: name,
    password: pass,
    avatar: avat,
    profileDescription: descript}, {withCredentials: true});
}

async function getReplies(id) {
  const result = await axios.get(`https://api.426twitter20.com/tweets/${id}/replies`, {withCredentials: true})
  return result;
}

async function tweet(text) {
    const result = await axios.post(`https://api.426twitter20.com/tweets`, {type: "tweet", body: text, userId: localStorage.getItem('uid')}, {withCredentials: true});
    return result;
}

async function retweet(id, text) {
    const result = await axios.post(`https://api.426twitter20.com/tweets`, {type: "retweet", body: text, parentId: id, mediaType: "none", mediaId: "", userId: localStorage.getItem('uid')}, {withCredentials: true});
    return result;
}

async function reply(id, text) {
    console.log(id);
    console.log(text);
    const result = await axios.post(`https://api.426twitter20.com/tweets`, {type: "reply", body: text, parentId: id, mediaType: "none", mediaId: "", userId: localStorage.getItem('uid')}, 
    {withCredentials: true});
    return result;
}

async function edit(id, replacement, type, IdMedia) {
    const result = await axios.put(`https://api.426twitter20.com/tweets/${id}`, {body: `${replacement}`, mediaType: type, mediaId: IdMedia, userId: localStorage.getItem('uid')}, {withCredentials: true});
}

async function deleteTweet(id) {
    const result = await axios.delete(`https://api.426twitter20.com/tweets/${id}`, {withCredentials: true});
}

async function recentTweets(){
    const result = await axios.get('https://api.426twitter20.com/tweets/recent', {withCredentials: true});
    return result.data;
}
