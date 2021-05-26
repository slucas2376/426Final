axios.defaults.withCredentials = true;
let columnNum = 0;
let call = 0;

$( async function () {

  // retriving user id of logged in user
  let uid = localStorage.getItem('uid');
  
  //getting entire user object of current user
  const result = await getUser(uid);
  $(`.name-here`).append(`Welcome ${result.displayName}`)
  // rendering the main feed
  await renderMainFeed();
  mainPageFeed(result);
  //calling renderProfile to render current user's profileS

  //await renderProfile(result.id);
  logoutButton()
});

// initializes all navbar buttons
function mainPageFeed(user){
  $(`#replaceFeed`).on('click', async () => {

      $(`#replaceFeed`).off();
      $(`#reset-page`).off();

      $(`.feed`).replaceWith(`
      <div class="box has-background-info feed">
        <form class="level" id="newTweet">
          <button class="button is-primary tweet">Tweet</button>
        </form>
      </div>
      `)
  
      tweetButton();
  
      let data = await recentTweets();
      
      await renderNewTweet(data, ".feed", false);
      
      setTimeout(function() {
        $(`#showProfile`).off();
        $(`#editProfile`).off();
        mainPageFeed(user);
      }, 2000)
  });

  $(`#showProfile`).on('click', async () => {
    await renderProfile(user.id);
  });

  $(`#editProfile`).on('click', async () => {
    await renderUserProfile(user)
  });

  $(`#reset-page`).on(`click`, async () => {
    $(`.column`).remove();
    $(`#replaceFeed`).off();
    $(`#reset-page`).off();

    await renderMainFeed();

    setTimeout(function() {
      $(`#showProfile`).off();
      $(`#editProfile`).off();
      mainPageFeed(user);
    }, 2000)
  });
}

// does this need to be async? idk really, if it doesn't have to be then probably best to make it sync
async function renderProfile(id) {
  // takes an input user ID and generates a new column with their profile and buttons to display their posted tweets, likes, and retweets
  // needs to add a column remove button at some point; when you work out formatting the handler is in there, just needs a button to attach to
  let user = await getUser(id);
  // user will be empty object if no such registered user exists
  if (user == {}) {console.log("profile retrieval failed"); return;}

  if($(`#${user.id}-profile`).length == 0) {
    $('.columns').append(`
        <div class="column ${user.id}-profile" id="${user.id}-profile">
        <div class="title has-text-centered">
          View of ${user.displayName}'s Profile
        </div>
          <div class="box has-background-info">
            <article class="message">
              <div class="message-header">
                ${user.displayName}'s Profile
                <button class="delete exitUser-${user.id}"></button>
              </div>
            </article>
            
            <div class="user_profile-${user.id}">
            <article class="media">
            <figure class="media-left">
              <div class="image is-128x128">
                <img class="is-rounded" src="${user.avatar}">
              </div>
            </figure>
            <div class="media-content">
              <div class="box"
                <h2 class="subtitle">Username: ${user.id}</h2>
                <h2 class="subtitle">Display Name: ${user.displayName}</h2>
                <h2 class="subtitle">Description: ${user.profileDescription}</h2>
              </div>              
            </div>
          </article>
            <br>
            <div class="buttons-${user.id} center">
              <button class="button is-link is-fullwidth" id="${user.id}-posted">View Posted Tweets</button>
              <button class="button is-link is-fullwidth" id="${user.id}-liked">View Liked Tweets</button>
              <button class="button is-link is-fullwidth" id="${user.id}-retweeted">View Retweets</button>
            </div>
          </div>
          <br>
          <div class="${user.id}-tweets" id="${user.id}-tweets"></div>
          </div>
        </div>
      `)

    userButtons(user);

  }
  /*// column delete button handler; replace `${user.id}-profile-remove` with whatever the column delete button is actually being called
  // (and make sure it's in an id field, or that you use the get by class functionality instead of get by ID)
  $(document.getElementById(`${user.id}-profile-remove`)).on('click', () => {
      $(document.getElementById(`${user.id}-profile`)).remove();
  })*/
}

function userButtons(user) {
  // removing listeners from the major buttons

  $(`.exitUser-${user.id}`).on('click', () => {
    $(`.${user.id}-profile`).remove();
  });

  // view button handlers
  $(document.getElementById(`${user.id}-posted`)).on('click', async () => {
    $(`.buttons-${user.id}`).replaceWith(`
    <div class="buttons-${user.id} center">
      <button class="button is-primary is-fullwidth" id="${user.id}-posted">View Posted Tweets</button>
      <button class="button is-link is-fullwidth" id="${user.id}-liked">View Liked Tweets</button>
      <button class="button is-link is-fullwidth" id="${user.id}-retweeted">View Retweets</button>
    </div>
    `);
    
    let tweetsToAdd = await getUsersTweets(user.id, "posts");
    let sendTweets = [];
    for (let i = 0; i <tweetsToAdd.length; i++ ) {
      if(tweetsToAdd[i].type != "reply") {
        sendTweets.push(tweetsToAdd[i])
      }
    }

    $(document.getElementById(`${user.id}-tweets`)).empty();
    await renderNewTweet(sendTweets, `#${user.id}-tweets`, false);
    
    userButtons(user);
  })
  $(document.getElementById(`${user.id}-liked`)).on('click', async () => {
    $(`.buttons-${user.id}`).replaceWith(`
    <div class="buttons-${user.id} center">
      <button class="button is-link is-fullwidth" id="${user.id}-posted">View Posted Tweets</button>
      <button class="button is-primary is-fullwidth" id="${user.id}-liked">View Liked Tweets</button>
      <button class="button is-link is-fullwidth" id="${user.id}-retweeted">View Retweets</button>
    </div>
    `);

    let tweetsToAdd = await getUsersTweets(user.id, "likes");
    $(document.getElementById(`${user.id}-tweets`)).empty();
    await renderNewTweet(tweetsToAdd, `#${user.id}-tweets`, false);
    userButtons(user);
  })
  $(document.getElementById(`${user.id}-retweeted`)).on('click', async () => {
    $(`.buttons-${user.id}`).replaceWith(`
    <div class="buttons-${user.id} center">
      <button class="button is-link is-fullwidth" id="${user.id}-posted">View Posted Tweets</button>
      <button class="button is-link is-fullwidth" id="${user.id}-liked">View Liked Tweets</button>
      <button class="button is-primary is-fullwidth" id="${user.id}-retweeted">View Retweets</button>
    </div>
    `);
    let tweetsToAdd = await getUsersTweets(user.id, "retweets"); // array of relevant tweets, most recent first, so just add by iterating through it
    $(document.getElementById(`${user.id}-tweets`)).empty();
    // if this for loop syntax doesn't work just rewrite it as the long one I guess? or figure out the rendering issue
    await renderNewTweet(tweetsToAdd, `#${user.id}-tweets`, false);
    userButtons(user);
  });
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
          renderProfile(result.userId);
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

//Javascript function to render the users own profile. Comes with edit buttons and the ability to manipulate your profile.
async function renderUserProfile(user) {
    if($(`.edit-${user.id}`).length == 0) {
      $('.columns').append(`
    <div class="column edit-${user.id}">
        <div class="title has-text-centered">
          Edit Profile
        </div>
        <div class="box">
          <article class="message">
              <div class="message-header">
                Edit Page
                <button class="delete deleteEditColumn-${user.id}"></button>
              </div>
            </article>
            <div class="user_profile">
            <h2 class="subtitle">UserId: ${user.id}</h2>
            <h2 class="subtitle">Username: ${user.displayName}</h2>
            <h2 class="subtitle">Description: ${user.profileDescription}</h2>
            <button type="submit" class=" button user_edit_button is-button is-info is-center">Edit User</button>
            </div>
        </div>
    </div>
    `);

    $(`.deleteEditColumn-${user.id}`).on('click', () => {
      $(`.edit-${user.id}`).remove();
    })

    //click handler for edit button
    $(`.user_edit_button`).on('click', async(e) => {
        let form = `
        <form class="fillout box">
                <div class="field">
                    <label class="label  has-text-centered">Remember, the page will reload once changes are submited!</label>
                    <label class="label">Display Name</label>
                    <div class="control">
                      <textarea class="textarea display-name small" placeholder="${user.displayName}" form="fillout box"></textarea>
                    </div>
                </div>

                <div class="field">
                  <div class="control">
                      <label class="label">Profile Avatar</label>
                      <textarea class="textarea new-avatar small" placeholder="${user.avatar}" form="fillout box"></textarea>
                  </div>
                </div>
                <div class="field">
                  <div class="control">
                    <label class="label">Profile Description</label>
                    <textarea class="textarea new-description small" placeholder="${user.profileDescription}" form="fillout box"></textarea>
                  </div>
                </div>

                <div class="field">
                    <div class="control">
                        <label class="label">Current Password</label>
                        <textarea class="textarea current-password small" placeholder="Needed to change any of your accounts properties" form="fillout box"></textarea>
                    </div>
                </div>

                <div class="field">
                    <div class="control">
                        <label class="label">New Password</label>
                        <textarea class="textarea new-password small" placeholder="Keep blank if you don't want to change your password" form="fillout box"></textarea>
                    </div>
                </div>

                <label class="label has-text-centered is-danger fail-message"></label>

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

        $(`#Save-Changes`).on('click', async () => {
            let updatedDisplayName = $(`.display-name`).val();
            let updatedPassword = $(`.new-password`).val();
            let updatedAvatar = $(`.new-avatar`).val();
            let updatedProfileDescription = $(`.new-description`).val();
            let currentPassword = $(`.current-password`).val();

            if (updatedDisplayName == "") {
              updatedDisplayName = user.displayName;
            }

            if (updatedProfileDescription == "") {
              updatedProfileDescription = user.profileDescription;
            }

            if (updatedAvatar == "") {
              updatedAvatar = user.avatar;
            }

            if (updatedPassword == "") {
              updatedPassword = currentPassword;
            }

            if(currentPassword != "") {
              try {
                await editUser(localStorage.getItem('uid'), updatedDisplayName, updatedPassword, updatedAvatar, updatedProfileDescription, currentPassword);
              } catch {
                $(`.fail-message`).replaceWith(`
                  <label class="label has-text-centered is-danger fail-message">
                    You didn't enter you correct, original password. Please try again.
                  </label>
                `);

                return false;
              }
              
            } else {
              $(`.fail-message`).replaceWith(`
                  <label class="label has-text-centered is-danger fail-message">
                    You didn't enter you correct, original password. Please try again.
                  </label>
                `);

                return false;
            }

            location.reload();
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

            await renderUserProfile(user2.data);
        });

         //click handler for delete button
    $(`#delete-profile`).on('click', async() => {
      //axios request
      let updatedDisplayName = $(`.display-name`).val();
      let updatedPassword = $(`.new-password`).val();
      let updatedAvatar = $(`.new-avatar`).val();
      let updatedProfileDescription = $(`.new-description`).val();
      let currentPassword = $(`.current-password`).val();

      if (updatedDisplayName == "") {
        updatedDisplayName = user.displayName;
      }

      if (updatedProfileDescription == "") {
        updatedProfileDescription = user.profileDescription;
      }

      if (updatedAvatar == "") {
        updatedAvatar = user.avatar;
      }

      if (updatedPassword == "") {
        updatedPassword = currentPassword;
      }

      if(currentPassword != "") {
        try {
          await editUser(localStorage.getItem('uid'), updatedDisplayName, updatedPassword, updatedAvatar, updatedProfileDescription, currentPassword);
        } catch {
          $(`.fail-message`).replaceWith(`
            <label class="label has-text-centered is-danger fail-message">
              You need the correct password when deleting your profile.
            </label>
          `);
          return false;
        }
            
        } else {
          $(`.fail-message`).replaceWith(`
            <label class="label has-text-centered is-danger fail-message">
              You didn't enter you correct password. Please try again.
            </label>
          `);

          return false;
        }

        const result = await axios({
          method: 'delete',
          url: 'https://api.426twitter20.com/users/' + user.id,
          data: {
            userId: localStorage.getItem(`uid`)
          },
          withCredentials: true,
        });

        window.location.replace("index.html");
      });
    });

    }
    
}

// still trying to figure out exactly how to provide the "tweet" object. 
async function renderNewTweet(data, element, source) {
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

      if (data[i] != {} || data[i] != undefined) {
        await renderTweetBody(data[i], element, bool, source);
      }

      bool = false;
    }
}

async function renderTweetBody(data, element, liked, source) {
    let user = await getUser(data.userId);
    let index = 0;

    while ($(`.edit-area-${data.id}-${index}`).length > 0) {
      index++;
    }
    console.log(data);
    if((data.type == "tweet" || data.type == "reply") && !source) {
      if(data.mediaType == "image") {
        $(`${element}`).append(`
        <article class="media tweet-${data.id}">
          <br>    
          <div class="box media-content">
              <article class="media">
                <figure class="media-left">
                  <div class="image is-64x64">
                    <img class="is-rounded userGate-${user.id}" src="${user.avatar}">
                  </div>
                </figure>
                <div class="media-content">
                  <div class="content type-${data.userId} clickReply-${data.id}">
                    <strong>${user.displayName}</strong> <small>@${data.userId}: ${data.createdAt.substring(0,10)}</small>
                    <div class="edit-area-${data.id}-${index}">
                      ${data.body}
                      <br>
                      <img class="has-ratio" width="50%" height="50%" src="${data.imageLink}">
                    </div>
                  </div>
                  <div class="retweet-reply-${data.id}-${index}"></div>
                  <div class="buttons-${data.id}-${index}"></div>
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
                        <div class="image is-64x64">
                          <img class="is-rounded userGate-${user.id}" src="${user.avatar}">
                        </div>
                      </figure>
                      <div class="media-content">
                        <div class="content type-${data.userId}">
                          <div class="clickReply-${data.id}">
                            <strong>${user.displayName}</strong> <small>@${data.userId}: ${data.createdAt.substring(0,10)}</small>
                              <div class="edit-area-${data.id}-${index}">
                              ${data.body}
                              <br>
                              <figure class="image is-16by9">
                                <iframe class="has-ratio" src="https://www.youtube.com/embed/${data.videoId}" frameborder="0" allowfullscreen></iframe>
                              </figure>
                              </div>
                          </div>
                        </div>
                        <div class="retweet-reply-${data.id}-${index}"></div>
                        <div class="buttons-${data.id}-${index}"></div>
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
                  <div class="image is-64x64">
                    <img class="is-rounded userGate-${user.id}" src="${user.avatar}">
                  </div>
                </figure>
                <div class="media-content">
                  <div class="content type-${data.userId} clickReply-${data.id}">
                    <strong>${user.displayName}</strong> <small>@${data.userId}: ${data.createdAt.substring(0,10)}</small>
                    <p class="edit-area-${data.id}-${index}">
                        ${data.body}
                    </p>
                  </div>
                  <div class="retweet-reply-${data.id}-${index}"></div>
                  <div class="buttons-${data.id}-${index}"></div>
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
                            <div class="image is-64x64">
                              <img class="is-rounded userGate-${user.id}" src="${user.avatar}">
                            </div>
                          </figure>
                          <div class="media-content">
                            <div class="content type-${data.userId} clickReply-${data.id}">
                              <strong>${user.displayName}</strong> <small>@${data.userId}: ${data.createdAt.substring(0,10)}</small>
                              <div class="edit-area-${data.id}-${index}">
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
                            <div class="retweet-reply-${data.id}-${index}"></div>
                            <div class="buttons-${data.id}-${index}"></div>
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
                          <div class="image is-64x64">
                            <img class="is-rounded userGate-${user.id}" src="${user.avatar}">
                          </div>
                        </figure>
                        <div class="media-content">
                          <div class="content type-${data.userId}">
                              <div class="clickReply-${data.id}">
                                <strong>${user.displayName}</strong> <small>@${data.userId}: ${data.createdAt.substring(0,10)}</small>
                                <div class="edit-area-${data.id}-${index}">
                                  ${data.body}
                                </div>
                                <br>
                              </div>
                              <article class="media">
                                <figure class="media-left">
                                  <div class="image is-64x64">
                                    <img class="is-rounded userGate-${userParent.id}" src="${userParent.avatar}">
                                  </div>
                                </figure>
                                <div class="media-content">
                                  <div class="content type-${parent.userId}">
                                    <div class="clickReply-${parent.id}">
                                      <strong>${userParent.displayName}</strong> <small>@${parent.userId}: ${parent.createdAt.substring(0,10)}</small>
                                      <br>
                                      ${parent.body}
                                      <br>
                                      <img class="has-ratio" width="50%" height="50%" src="${parent.imageLink}">
                                      <br>
                                    </div>
                                  </div>
                                </div>
                              </article>
                          </div>
                          <div class="retweet-reply-${data.id}-${index}"></div>
                          <div class="buttons-${data.id}-${index}"></div>
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
                          <div class="image is-64x64">
                            <img class="is-rounded userGate-${user.id}" src="${user.avatar}">
                          </div>
                        </figure>
                        <div class="media-content">
                          <div class="content type-${data.userId}">
                            <div class="clickReply-${data.id}">
                              <strong>${user.displayName}</strong> <small>@${data.userId}: ${data.createdAt.substring(0,10)}</small>
                              <div class="edit-area-${data.id}-${index}">
                                ${data.body}
                              </div>
                              <br>
                              </div>
                              <article class="media">
                                <figure class="media-left">
                                  <div class="image is-64x64">
                                    <img class="is-rounded userGate-${userParent.id}" src="${userParent.avatar}">
                                  </div>
                                </figure>
                                <div class="media-content">
                                  <div class="content type-${parent.userId} clickReply-${parent.id}">
                                      <strong>${userParent.displayName}</strong> <small>@${parent.userId}: ${parent.createdAt.substring(0,10)}</small>
                                      <br>
                                      ${parent.body}
                                      <br>
                                      <figure class="image is-16by9">
                                        <iframe class="has-ratio" src="https://www.youtube.com/embed/${parent.videoId}" frameborder="0" allowfullscreen></iframe>
                                      </figure>
                                  </div>
                                </div>
                              </article>
                          </div>
                          <div class="retweet-reply-${data.id}-${index}"></div>
                          <div class="buttons-${data.id}-${index}"></div>
                        </div>
                      </article>
                      
                    </div>

                  </article>
              `);

            } else if (parent.type == "reply") {
              let replyParent = await getTweet(parent.parentId);
                $(`${element}`).append(`
                    <article class="media tweet-${data.id}">
                      <br>  
                      <div class="box media-content">
                        <article class="media">
                          <figure class="media-left">
                            <div class="image is-64x64">
                              <img class="is-rounded userGate-${user.id}" src="${user.avatar}">
                            </div>
                          </figure>
                          <div class="media-content">
                            <div class="content type-${data.userId}">
                                <div class="clickReply-${data.id}">
                                  <strong>${user.displayName}</strong> <small>@${data.userId}: ${data.createdAt.substring(0,10)}</small>
                                  <div class="edit-area-${data.id}-${index}">
                                    ${data.body}
                                  </div>
                                  <br>
                                </div>
                                <article class="media">
                                  <figure class="media-left">
                                    <div class="image is-64x64">
                                      <img class="is-rounded userGate-${userParent.id}" src="${userParent.avatar}">
                                    </div>
                                  </figure>
                                  <div class="media-content">
                                    <div class="content type-${parent.userId} clickReply-${parent.id}">
                                        <strong>${userParent.displayName}</strong> <small>@${parent.userId}: ${parent.createdAt.substring(0,10)}</small>
                                        <div>
                                        ${parent.body}
                                        </div>
                                        <br>
                                    </div>
                                  </div>
                                </article>
                            </div>
                            <button class=" button is-info clickReply-${parent.parentId} is-small"> Show Origin Feed </button>
                            <br>
                            <br>
                            <div class="retweet-reply-${data.id}-${index}"></div>
                            <div class="buttons-${data.id}-${index}"></div>
                          </div>
                        </article>
                        
                      </div>
                    </article>
                `);
              
                renderTweetReplies(replyParent);
            } else {
              $(`${element}`).append(`
                    <article class="media tweet-${data.id}">
                      <br>  
                      <div class="box media-content">
                        <article class="media">
                          <figure class="media-left">
                            <div class="image is-64x64">
                              <img class="is-rounded userGate-${user.id}" src="${user.avatar}">
                            </div>
                          </figure>
                          <div class="media-content">
                            <div class="content type-${data.userId}">
                                <div class="clickReply-${data.id}">
                                  <strong>${user.displayName}</strong> <small>@${data.userId}: ${data.createdAt.substring(0,10)}</small>
                                  <div class="edit-area-${data.id}-${index}">
                                    ${data.body}
                                  </div>
                                  <br>
                                </div>
                                <article class="media">
                                  <figure class="media-left">
                                    <div class="image is-64x64">
                                      <img class="is-rounded userGate-${userParent.id}" src="${userParent.avatar}">
                                    </div>
                                  </figure>
                                  <div class="media-content">
                                    <div class="content type-${parent.userId} clickReply-${parent.id}">
                                        <strong>${userParent.displayName}</strong> <small>@${parent.userId}: ${parent.createdAt.substring(0,10)}</small>
                                        <div>
                                        ${parent.body}
                                        </div>
                                        <br>
                                    </div>
                                  </div>
                                </article>
                            </div>
                            <div class="retweet-reply-${data.id}-${index}"></div>
                            <div class="buttons-${data.id}-${index}"></div>
                          </div>
                        </article>
                        
                      </div>
                    </article>
                `);
            }
        renderTweetReplies(parent);
        imageToProfile(userParent.id)
    } else {
      let replyParent = await getTweet(data.parentId);
      $(`${element}`).append(`
        <article class="media tweet-${data.id}">
          <br>    
          <div class="box media-content">
              <article class="media">
                <figure class="media-left">
                  <div class="image is-64x64">
                    <img class="is-rounded userGate-${user.id}" src="${user.avatar}">
                  </div>
                </figure>
                <div class="media-content">
                  <div class="content type-${data.userId} clickReply-${data.id}">
                    <strong>${user.displayName}</strong> <small>@${data.userId}: ${data.createdAt.substring(0,10)}</small>
                    <div class="edit-area-${data.id}-${index}">
                      ${data.body}
                      <br>
                      <img class="has-ratio" width="50%" height="50%" src="${data.imageLink}">
                    </div>
                  </div>
                  <button class=" button is-info clickReply-${data.parentId} is-small"> Show Origin Feed </button>
                  <br>
                  <br>
                  <div class="retweet-reply-${data.id}-${index}"></div>
                  <div class="buttons-${data.id}-${index}"></div>
                </div>
              </article>
              
            </div>
        </article>
        
        `);
        renderTweetReplies(replyParent);
    }
    
    if (user.id == localStorage.getItem('uid')) {
      $(`.buttons-${data.id}-${index}`).replaceWith(`
        <div class="buttons-${data.id}-${index}">
          <button class="button like-${data.id} is-info is-small">Like: ${data.likeCount}</button>
          <button class="button retweet-${data.id}-${index} is-info is-small">Retweet: ${data.retweetCount}</button>
          <button class="button reply-${data.id}-${index} is-info is-small">Reply: ${data.replyCount}</button>
          <button class="button edit-${data.id}-${index} is-info is-small">Edit</button>
          <button class="button delete-${data.id} is-danger is-small"> Delete </button>
        </div>
      `);
        
     } else {
      $(`.buttons-${data.id}-${index}`).replaceWith(`
        <div class="buttons-${data.id}-${index}">
          <button class="button like-${data.id} is-info is-small">Like: ${data.likeCount}</button>
          <button class="button retweet-${data.id}-${index} is-info is-small">Retweet: ${data.retweetCount}</button>
          <button class="button reply-${data.id}-${index} is-info is-small">Reply: ${data.replyCount} </button>
       </div>
     `);    
    }

    like(data, liked);
    editButton(data, index);
    retweetButton(data, index);
    replyButton(data, index);
    deleteButton(data);
    renderTweetReplies(data);
    imageToProfile(user.id);

}

// finish later
function intializeAllButtons(tweet, user) {

}

function imageToProfile(id){
  $(`.userGate-${id}`).off();
  $(`.userGate-${id}`).on('click', async () => {
    await renderProfile(id);
  })
}

function renderTweetReplies(data) {
    // when new tweet bodies of the same id are created the listener is removed and re-applied to all intances
    // avoids major error of placing multiple of the same event listeners
    
    $(`.clickReply-${data.id}`).off();
    // makes it so there won't be multiple of the same listener on the different/same tweets
    $(`.clickReply-${data.id}`).on('click', async () => {

      // a replyfield means no creation of a repliefield can happen
      if (($(`.replyfield-${data.id}`).length == 0) && (columnNum < 5)) {
        columnNum += 1;
        let replys = await getReplies(data.id);
        // initializing the new tweet and reply column
        // Later there will be a close button to delete the column completely and reinstantiate the reply event listener for the tweet body
        $('.columns').append(
          `<div class="column replyfield-${data.id}">
            <div class="title has-text-centered">
              What's Happening!
            </div>
            <div class="box has-background-info tweetReply-${data.id}">
            <article class="message">
              <div class="message-header">
                ${data.userId}'s Tweet
                <button class="delete deleteReply-${data.id}"></button>
              </div>
            </article>
            </div>
          </div>`
        );
    
        $(`.deleteReply-${data.id}`).on('click', async () => {
          $(`.replyfield-${data.id}`).remove();
          columnNum -= 1;
          await renderTweetReplies(data);
        });
  
        if(data.parentId != "" || data.parentId != undefined) {
          await renderNewTweet([data], `.tweetReply-${data.id}`, true);
        } else {
          await renderNewTweet([data], `.tweetReply-${data.id}`, false);
        }

        $(`.tweetReply-${data.id}`).append(`
          <br>
          <article class="message">
           <div class="message-header">
              Replies to ${data.userId}'s Tweet
            </div>
          </article>
          <div class="tweetReplyField-${data.id}"></div>
        `);
  
        // turns off click event listener for tweet body to avoid creating tons of reply columns
        $(`.clickReply-${data.id}`).off();
  
        // no replys gives basic "no replies" message
        if (replys.data.length == 0) {
          $(`.tweetReplyField-${data.id}`).append(`
            <article class="media noReplies-${data.id}">
              <div class="box media-content">
                <article class="media">
                  <figure class="media-left">
                    <h1 class="has-text-centered"> No replys </h1>
                  </figure>
                </article>
              </div>
            </article>
          `)
        } else {
          // renders the new replies similar to the main twitter feed.
          // uses the abstraction of the renderNewTweet function to accomplish this
          await renderNewTweet(replys.data, `.tweetReplyField-${data.id}`, false)
        }
      }
    }); 
}

async function renderMainFeed() {
    $(`.columns`).append(`
        <div class="column mainfeed">
            <div class="title has-text-centered">
              What's Happening!
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

function editButton(data, index) {

  $(`.edit-${data.id}-${index}`).on('click', () => {
    $(`.clickReply-${data.id}`).off();
    $(`.retweet-${data.id}-${index}`).off();
    $(`.reply-${data.id}-${index}`).off();
    
    if (data.mediaType == "video") {
      $(`.edit-area-${data.id}-${index}`).replaceWith(`
      <div class="edit-area-${data.id}">
        <div class="field">
          <div class="contianer">
            <p> Main Body </p>
            <textarea class="replace-${data.id}-${index}"> ${data.body} </textarea>
            <p> Video Link </p>
            <textarea class="replace-video-${data.id}-${index}"> https://www.youtube.com/watch?v=${data.videoId} </textarea>
          </div>
        </div>
        <div class="edit-buttons-${data.id}-${index}">
          <button class="button submit-edit-${data.id}-${index} is-info is-small" type="button">Submit Edit</button>
          <button class="button cancel-edit-${data.id}-${index} is-danger is-small" type="button"> Cancel </button>
        </div>
      </div>
      `);
    } else if (data.mediaType == "image") {
      $(`.edit-area-${data.id}-${index}`).replaceWith(`
      <div class="edit-area-${data.id}-${index}">
        <div class="field">
          <div class="contianer">
            <p> Main Body </p>
            <textarea class="replace-${data.id}-${index}"> ${data.body} </textarea>
            <p> Image Link </p>
            <textarea class="replace-image-${data.id}-${index}"> ${data.imageLink} </textarea>
            </div>
        </div>
        <div class="edit-buttons-${data.id}-${index}">
          <button class="button submit-edit-${data.id}-${index} is-info is-small" type="button">Submit Edit</button>
          <button class="button cancel-edit-${data.id}-${index} is-danger is-small" type="button"> Cancel </button>
        </div>
      </div>
      `);
    } else {
      $(`.edit-area-${data.id}-${index}`).replaceWith(`
      <div class="edit-area-${data.id}-${index}">
        <div class="field">
          <div class="contianer">
            <textarea class="replace-${data.id}-${index}"> ${data.body} </textarea>
          </div>
        </div>
        <div class="edit-buttons-${data.id}-${index}">
          <button class="button submit-edit-${data.id}-${index} is-info is-small" type="button">Submit Edit</button>
          <button class="button cancel-edit-${data.id}-${index} is-danger is-small" type="button"> Cancel </button>
        </div>
      </div>
    `);
    }

    $(`.edit-${data.id}-${index}`).replaceWith(`
      <button class="button edit-${data.id}-${index} is-info is-small">Edit</button>
    `);

    $(`.submit-edit-${data.id}-${index}`).on('click', async () => {
      let final = $(`.replace-${data.id}-${index}`).val();

      data.body = final;

      if ( data.mediaType == "image") {
        
        let link = $(`.replace-image-${data.id}-${index}`).val();
        
        await edit(data.id, final, "image", link);

        data.imageLink = link

        $(`.edit-area-${data.id}-${index}`).replaceWith(`
          <div class="edit-area-${data.id}-${index}">
            ${data.body}
            <br>
            <img class="has-ratio" width="50%" height="50%" src="${link}">
          </div>
        `);

      } else if ( data.mediaType == "video") {

        let position = $(`.replace-video-${data.id}-${index}`).val().indexOf("watch?v=") + 8;
        let link = $(`.replace-video-${data.id}-${index}`).val().substring(position, $(`.replace-video-${data.id}-${index}`).val().length);

        await edit(data.id, final, "video", link);
      
        data.videoId = link;

        $(`.edit-area-${data.id}-${index}`).replaceWith(`
          <div class="edit-area-${data.id}-${index}">
            ${data.body}
            <br>
            <figure class="image is-16by9">
              <iframe class="has-ratio" src="https://www.youtube.com/embed/${data.videoId}" frameborder="0" allowfullscreen></iframe>
            </figure>
          </div>
        `);
      
      } else {
        await edit(data.id, final, "none", "");
        $(`.edit-area-${data.id}-${index}`).replaceWith(`
          <div class="edit-area-${data.id}-${index}">
            ${data.body}
            <br>
          </div>
        `);
        
      }
      retweetButton(data, index);
      replyButton(data, index);
      renderTweetReplies(data);
      editButton(data, index);
    });

    $(`.cancel-edit-${data.id}-${index}`).on('click', () => {
      if ( data.mediaType == "image") {
        $(`.edit-area-${data.id}-${index}`).replaceWith(`
          <div class="edit-area-${data.id}-${index}">
            ${data.body}
            <br>
            <img class="has-ratio" width="50%" height="50%" src="${data.imageLink}">
          </div>
        `);

      } else if ( data.mediaType == "video") {
        $(`.edit-area-${data.id}-${index}`).replaceWith(`
          <div class="edit-area-${data.id}-${index}">
            ${data.body}
            <br>
            <figure class="image is-16by9">
              <iframe class="has-ratio" src="https://www.youtube.com/embed/${data.videoId}" frameborder="0" allowfullscreen></iframe>
            </figure>
          </div>
        `);
      
      } else {
        $(`.edit-area-${data.id}-${index}`).replaceWith(`
          <div class="edit-area-${data.id}-${index}">
            ${data.body}
            <br>
          </div>
        `);
      }
      retweetButton(data, index);
      replyButton(data, index);
      renderTweetReplies(data);
      editButton(data, index);
    });
  });
}

function retweetButton(data, index) {
  $(`.retweet-${data.id}-${index}`).on('click', () => {
    $(`.edit-${data.id}-${index}`).off();
    $(`.retweet-reply-${data.id}-${index}`).replaceWith(`
      <div class="retweet-reply-${data.id}-${index}">
        <div class="field">
          <div class="contianer">
            <div class="control">
              <textarea class="retweet-body-${data.id}-${index}" placeholder="retweet away" rows="5" class="input" type="text"></textarea>
            </div>  
          </div>
        </div>
        <div class="retweet-buttons-${data.id}-${index}">
          <button class="button retweet-submit-${data.id}-${index} is-info is-small" type="button">Submit Retweet</button>
          <button class="button retweet-cancel-${data.id}-${index} is-danger is-small" type="button">Cancel</button>
        </div>
        <br>
      </div>
    `);

    $(`.retweet-${data.id}-${index}`).replaceWith(`
      <button class="button retweet-${data.id}-${index} is-info is-small">Retweet: ${data.retweetCount}</button>
    `);

    $(`.retweet-submit-${data.id}-${index}`).on('click', async () => {
      data.retweetCount += 1;
      let final = $(`.retweet-body-${data.id}-${index}`).val();

      let newRetwe = await retweet(data.id, final);
      let retwe = newRetwe.data;

      // prepending retweet to feed
      let user = await getUser(retwe.userId)
      let parent = await getTweet(retwe.parentId);
      let userParent = await getUser(parent.userId);
      let element = `.feed`;
      if (parent == "Tweet has been deleted.") {
              $(`${element}`).prepend(`
                  <article class="media tweet-${retwe.id}">
                    <br>  
                    <div class="box media-content">
                      <article class="media">
                        <figure class="media-left">
                          <div class="image is-64x64">
                            <img class="is-rounded userGate-${user.id}" src="${user.avatar}">
                          </div>
                        </figure>
                        <div class="media-content">
                          <div class="content type-${retwe.userId} clickReply-${retwe.id}">
                            <strong>${user.displayName}</strong> <small>@${retwe.userId}: ${retwe.createdAt.substring(0,10)}</small>
                            <div class="edit-area-${retwe.id}-${index}">
                            ${retwe.body}
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
                          <div class="retweet-reply-${retwe.id}-${index}"></div>
                          <div class="buttons-${retwe.id}-${index}">
                            <button class="button like-${retwe.id} is-info is-small">Like: ${retwe.likeCount}</button>
                            <button class="button retweet-${retwe.id}-${index} is-info is-small">Retweet: ${retwe.retweetCount}</button>
                            <button class="button reply-${retwe.id}-${index} is-info is-small">Reply: ${retwe.replyCount}</button>
                            <button class="button edit-${retwe.id}-${index} is-info is-small">Edit</button>
                            <button class="button delete-${retwe.id} is-danger is-small"> Delete </button>
                        </div>
                        </div>
                      </article>
                    </div>
                  </article>
              `);
          } else if ( parent.mediaType == "image" ) {
            $(`${element}`).prepend(`
                <article class="media tweet-${retwe.id}">
                <br>
                  <div class="box media-content">
                    <article class="media">
                      <figure class="media-left">
                        <div class="image is-64x64">
                          <img class="is-rounded userGate-${user.id}" src="${user.avatar}">
                        </div>
                      </figure>
                      <div class="media-content">
                        <div class="content type-${retwe.userId}">
                            <div class="clickReply-${retwe.id}">
                              <strong>${user.displayName}</strong> <small>@${retwe.userId}: ${retwe.createdAt.substring(0,10)}</small>
                              <div class="edit-area-${retwe.id}-${index}">
                                ${retwe.body}
                              </div>
                              <br>
                            </div>
                            <article class="media">
                              <figure class="media-left">
                                <div class="image is-64x64">
                                  <img class="is-rounded userGate-${userParent.id}" src="${userParent.avatar}">
                                </div>
                              </figure>
                              <div class="media-content">
                                <div class="content type-${parent.userId}">
                                  <div class="clickReply-${parent.id}">
                                    <strong>${userParent.displayName}</strong> <small>@${parent.userId}: ${parent.createdAt.substring(0,10)}</small>
                                    <br>
                                    ${parent.body}
                                    <br>
                                    <img class="has-ratio" width="50%" height="50%" src="${parent.imageLink}">
                                    <br>
                                  </div>
                                </div>
                              </div>
                            </article>
                        </div>
                        <div class="retweet-reply-${retwe.id}-${index}"></div>
                        <div class="buttons-${retwe.id}-${index}">
                          <button class="button like-${retwe.id} is-info is-small">Like: ${retwe.likeCount}</button>
                          <button class="button retweet-${retwe.id}-${index} is-info is-small">Retweet: ${retwe.retweetCount}</button>
                          <button class="button reply-${retwe.id}-${index} is-info is-small">Reply: ${retwe.replyCount}</button>
                          <button class="button edit-${retwe.id}-${index} is-info is-small">Edit</button>
                          <button class="button delete-${retwe.id} is-danger is-small"> Delete </button>
                        </div>
                      </div>
                    </article>
                    
                  </div>

                </article>
            `);
          
          } else if( parent.mediaType == "video" ) { 
            $(`${element}`).prepend(`
                <article class="media tweet-${retwe.id}">
                  <br>
                  <div class="box media-content">
                    <article class="media">
                      <figure class="media-left">
                        <div class="image is-64x64">
                          <img class="is-rounded userGate-${user.id}" src="${user.avatar}">
                        </div>
                      </figure>
                      <div class="media-content">
                        <div class="content type-${retwe.userId}">
                          <div class="clickReply-${retwe.id}">
                            <strong>${user.displayName}</strong> <small>@${retwe.userId}: ${retwe.createdAt.substring(0,10)}</small>
                            <div class="edit-area-${retwe.id}-${index}">
                              ${retwe.body}
                            </div>
                            <br>
                            </div>
                            <article class="media">
                              <figure class="media-left">
                                <div class="image is-64x64">
                                  <img class="is-rounded userGate-${userParent.id}" src="${userParent.avatar}">
                                </div>
                              </figure>
                              <div class="media-content">
                                <div class="content type-${parent.userId} clickReply-${parent.id}">
                                    <strong>${userParent.displayName}</strong> <small>@${parent.userId}: ${parent.createdAt.substring(0,10)}</small>
                                    <br>
                                    ${parent.body}
                                    <br>
                                    <figure class="image is-16by9">
                                      <iframe class="has-ratio" src="https://www.youtube.com/embed/${parent.videoId}" frameborder="0" allowfullscreen></iframe>
                                    </figure>
                                </div>
                              </div>
                            </article>
                        </div>
                        <div class="retweet-reply-${retwe.id}-${index}"></div>
                        <div class="buttons-${retwe.id}-${index}">
                          <button class="button like-${retwe.id} is-info is-small">Like: ${retwe.likeCount}</button>
                          <button class="button retweet-${retwe.id}-${index} is-info is-small">Retweet: ${retwe.retweetCount}</button>
                          <button class="button reply-${retwe.id}-${index} is-info is-small">Reply: ${retwe.replyCount}</button>
                          <button class="button edit-${retwe.id}-${index} is-info is-small">Edit</button>
                          <button class="button delete-${retwe.id} is-danger is-small"> Delete </button>
                        </div>
                      </div>
                    </article>
                    
                  </div>

                </article>
            `);

          } else if (parent.type == "reply") {
            let replyParent = await getTweet(parent.parentId);
              $(`${element}`).prepend(`
                  <article class="media tweet-${retwe.id}">
                    <br>  
                    <div class="box media-content">
                      <article class="media">
                        <figure class="media-left">
                          <div class="image is-64x64">
                            <img class="is-rounded userGate-${user.id}" src="${user.avatar}">
                          </div>
                        </figure>
                        <div class="media-content">
                          <div class="content type-${retwe.userId}">
                              <div class="clickReply-${retwe.id}">
                                <strong>${user.displayName}</strong> <small>@${retwe.userId}: ${retwe.createdAt.substring(0,10)}</small>
                                <div class="edit-area-${retwe.id}-${index}">
                                  ${retwe.body}
                                </div>
                                <br>
                              </div>
                              <article class="media">
                                <figure class="media-left">
                                  <div class="image is-64x64">
                                    <img class="is-rounded userGate-${userParent.id}" src="${userParent.avatar}">
                                  </div>
                                </figure>
                                <div class="media-content">
                                  <div class="content type-${parent.userId} clickReply-${parent.id}">
                                      <strong>${userParent.displayName}</strong> <small>@${parent.userId}: ${parent.createdAt.substring(0,10)}</small>
                                      <div>
                                      ${parent.body}
                                      </div>
                                      <br>
                                  </div>
                                </div>
                              </article>
                          </div>
                          <button class=" button is-info clickReply-${parent.parentId} is-small"> Show Origin Feed </button>
                          <br>
                          <br>
                          <div class="retweet-reply-${retwe.id}-${index}"></div>
                          <div class="buttons-${retwe.id}-${index}">
                            <button class="button like-${retwe.id} is-info is-small">Like: ${retwe.likeCount}</button>
                            <button class="button retweet-${retwe.id}-${index} is-info is-small">Retweet: ${retwe.retweetCount}</button>
                            <button class="button reply-${retwe.id}-${index} is-info is-small">Reply: ${retwe.replyCount}</button>
                            <button class="button edit-${retwe.id}-${index} is-info is-small">Edit</button>
                            <button class="button delete-${retwe.id} is-danger is-small"> Delete </button>
                          </div>
                        </div>
                      </article>
                      
                    </div>
                  </article>
              `);
            
              renderTweetReplies(replyParent);
          } else {
            $(`${element}`).prepend(`
                  <article class="media tweet-${retwe.id}">
                    <br>  
                    <div class="box media-content">
                      <article class="media">
                        <figure class="media-left">
                          <div class="image is-64x64">
                            <img class="is-rounded userGate-${user.id}" src="${user.avatar}">
                          </div>
                        </figure>
                        <div class="media-content">
                          <div class="content type-${retwe.userId}">
                              <div class="clickReply-${retwe.id}">
                                <strong>${user.displayName}</strong> <small>@${retwe.userId}: ${retwe.createdAt.substring(0,10)}</small>
                                <div class="edit-area-${retwe.id}-${index}">
                                  ${retwe.body}
                                </div>
                                <br>
                              </div>
                              <article class="media">
                                <figure class="media-left">
                                  <div class="image is-64x64">
                                    <img class="is-rounded userGate-${userParent.id}" src="${userParent.avatar}">
                                  </div>
                                </figure>
                                <div class="media-content">
                                  <div class="content type-${parent.userId} clickReply-${parent.id}">
                                      <strong>${userParent.displayName}</strong> <small>@${parent.userId}: ${parent.createdAt.substring(0,10)}</small>
                                      <div>
                                      ${parent.body}
                                      </div>
                                      <br>
                                  </div>
                                </div>
                              </article>
                          </div>
                          <div class="retweet-reply-${retwe.id}-${index}"></div>
                          <div class="buttons-${retwe.id}-${index}">
                            <button class="button like-${retwe.id} is-info is-small">Like: ${retwe.likeCount}</button>
                            <button class="button retweet-${retwe.id}-${index} is-info is-small">Retweet: ${retwe.retweetCount}</button>
                            <button class="button reply-${retwe.id}-${index} is-info is-small">Reply: ${retwe.replyCount}</button>
                            <button class="button edit-${retwe.id}-${index} is-info is-small">Edit</button>
                            <button class="button delete-${retwe.id} is-danger is-small"> Delete </button>
                          </div>
                        </div>
                      </article>
                      
                    </div>
                  </article>
              `);
          }
        renderTweetReplies(parent);
        imageToProfile(userParent.id)
        like(retwe, false);
        editButton(retwe, index);
        retweetButton(retwe, index);
        replyButton(retwe, index);
        deleteButton(retwe);
        renderTweetReplies(retwe);
        imageToProfile(user.id);

        $('#newTweet').remove();
          $(`.feed`).prepend(`
            <form class="level" id="newTweet">
              <button class="button is-primary tweet">Tweet</button>
            </form>
          `);

        tweetButton();

        

      $(`.retweet-${data.id}`).replaceWith(`
        <button class="button retweet-${data.id}-${index} is-info is-small"> Retweet: ${data.retweetCount} </button>
      `)

      $(`.retweet-reply-${data.id}-${index}`).replaceWith(`
      <div class="retweet-reply-${data.id}-${index}"></div>
      `);
      editButton(data, index);
      retweetButton(data, index);
    });


    $(`.retweet-cancel-${data.id}-${index}`).on('click', () => {
      $(`.retweet-reply-${data.id}-${index}`).replaceWith(`
        <div class="retweet-reply-${data.id}-${index}"></div>
      `);
      editButton(data, index);
      retweetButton(data, index);
    });
  })

  
}

function replyButton(data, index) {

  $(`.reply-${data.id}-${index}`).on('click', () => {
    $(`.edit-${data.id}-${index}`).off();
    $(`.retweet-reply-${data.id}-${index}`).replaceWith(`
      <div class="retweet-reply-${data.id}-${index}">
        <div class="field">
          <div class="contianer">
            <div class="control">
              <textarea class="reply-body-${data.id}-${index}" placeholder="reply away" rows="5" class="input" type="text"></textarea>
            </div>
          </div>
        </div>
      <div class="reply-buttons-${data.id}-${index}">
        <button class="button reply-submit-${data.id}-${index} is-info is-small" type="button">Submit Reply</button>
        <button class="button reply-cancel-${data.id}-${index} is-danger is-small" type="button"> Cancel </button>
      </div>
      <br>
    </div>
    `);

    $(`.reply-${data.id}-${index}`).replaceWith(`
      <button class="button reply-${data.id}-${index} is-info is-small">Reply: ${data.replyCount}</button>
    `);

    $(`.reply-submit-${data.id}-${index}`).on('click', async () => {
      data.replyCount += 1;
      let final = $(`.reply-body-${data.id}-${index}`).val();
      let replys = await reply(data.id, final);

      $(`.reply-${data.id}-${index}`).replaceWith(`
        <button class="button reply-${data.id}-${index} is-info is-small"> Reply: ${data.replyCount} </button>
      `)

      $(`.noReplies-${data.id}`).remove();

      let user = await getUser(replys.data.userId)

      $(`.tweetReplyField-${replys.data.parentId}`).prepend(`
      <article class="media tweet-${replys.data.id}">
        <br>    
        <div class="box media-content">
            <article class="media">
              <figure class="media-left">
                <div class="image is-64x64">
                  <img class="is-rounded userGate-${user.id}" src="${user.avatar}">
                </div>
              </figure>
              <div class="media-content">
                <div class="content type-${replys.data.userId} clickReply-${replys.data.id}">
                  <strong>${user.displayName}</strong> <small>@${replys.data.userId}: ${replys.data.createdAt.substring(0,10)}</small>
                  <p class="edit-area-${replys.data.id}-0">
                      ${replys.data.body}
                  </p>
                </div>
                <div class="retweet-reply-${replys.data.id}-0"></div>
                <div class="buttons-${data.id}-${index}">
                  <button class="button like-${replys.data.id} is-info is-small">Like: ${replys.data.likeCount}</button>
                  <button class="button retweet-${replys.data.id}-0 is-info is-small">Retweet: ${replys.data.retweetCount}</button>
                  <button class="button reply-${replys.data.id}-0 is-info is-small">Reply: ${replys.data.replyCount}</button>
                  <button class="button edit-${replys.data.id}-0 is-info is-small">Edit</button>
                  <button class="button delete-${replys.data.id} is-danger is-small"> Delete </button>
                </div>
              </div>
            </article>
            
          </div>
        </article>
      
      `);

      like(replys.data, false);
      editButton(replys.data, 0);
      retweetButton(replys.data, 0);
      replyButton(replys.data, 0);
      deleteButton(replys.data);
      renderTweetReplies(replys.data);
      imageToProfile(replys.data.userId);


      $(`.retweet-reply-${data.id}-${index}`).replaceWith(`
        <div class="retweet-reply-${data.id}-${index}"></div>
      `);
      editButton(data, index);
      replyButton(data, index);
    });


    $(`.reply-cancel-${data.id}-${index}`).on('click', () => {
      $(`.retweet-reply-${data.id}-${index}`).replaceWith(`
        <div class="retweet-reply-${data.id}-${index}"></div>
      `);
      editButton(data, index);
      replyButton(data, index);
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
            <label class="label">Image and Gif URLs</label>
            <div class="control">
              <input id="link" class="input" type="text" placeholder="image or gif link">
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
                <br>
                <div class="box media-content">
                  <article class="media">
                    <figure class="media-left">
                      <p class="image is-64x64">
                        <img class="is-rounded userGate-${user.id}" src="${user.avatar}">
                      </p>
                    </figure>
                    <div class="media-content">
                      <div class="content type-${result.userId} clickReply-${result.id}">
                      <strong>${user.displayName}</strong> <small>@${user.id}: ${result.createdAt.substring(0,10)}</small>
                        <div class="edit-area-${result.id}-0">
                          ${result.body}
                          <br>
                        </div>
                        <figure class="image is-16by9">
                         <iframe class="has-ratio" src="https://www.youtube.com/embed/${result.videoId}" frameborder="0" allowfullscreen></iframe>
                        </figure>
                      </div>
                      <div class="retweet-reply-${result.id}-0"></div>
                      <div class="buttons-${result.id}-0">
                        <button class="button like-${result.id} is-info is-small">Like</button>
                        <button class="button retweet-${result.id}-0 is-info is-small">Retweet: ${result.retweetCount}</button>
                        <button class="button reply-${result.id}-0 is-info is-small">Reply: ${result.replyCount}</button>
                        <button class="button edit-${result.id}-0 is-info is-small">Edit</button>
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
          like(result, false);
          retweetButton(result, 0);
          replyButton(result, 0);
          editButton(result, 0);
          deleteButton(result);
          renderTweetReplies(result);
          imageToProfile(result.userId);

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
                <br>
                <div class="box media-content">
                  <article class="media">
                    <figure class="media-left">
                      <p class="image is-64x64">
                        <img class="is-rounded userGate-${user.id}" src="${user.avatar}">
                      </p>
                    </figure>
                    <div class="media-content">
                      <div class="content type-${result.userId} clickReply-${result.id}">
                        <strong>${user.displayName}</strong> <small>@${user.id}: ${result.createdAt.substring(0,10)}</small>
                        <div class="edit-area-${result.id}-0">
                          ${result.body}
                          <br>
                        </div>
                        <img class="has-ratio" width="50%" height="50%" src="${result.imageLink}">
                      </div>
                      <div class="retweet-reply-${result.id}-0"></div>
                      <div class="buttons-${result.id}-0">
                        <button class="button like-${result.id} is-info is-small">Like</button>
                        <button class="button retweet-${result.id}-0 is-info is-small">Retweet: ${result.retweetCount}</button>
                        <button class="button reply-${result.id}-0 is-info is-small">Reply: ${result.replyCount}</button>
                        <button class="button edit-${result.id}-0 is-info is-small">Edit</button>
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
          like(result, false);
          retweetButton(result, 0);
          replyButton(result, 0);
          editButton(result, 0);
          deleteButton(result);
          renderTweetReplies(result);
          imageToProfile(result.userId);

        } else { 
          let result = await tweet($(`#tweetCreation`).val());
          let user = await getUser(localStorage.getItem('uid'));
          let posts = await getUsersTweets(localStorage.getItem('uid'), "posts");
          result = posts[0];

          $(`.feed`).prepend(`
            <article class="media tweet-${result.id}">
                <br>
                <div class="box media-content">
                  <article class="media">
                    <figure class="media-left">
                      <p class="image is-64x64">
                        <img class="is-rounded userGate-${user.id}" src="${user.avatar}">
                      </p>
                    </figure>
                    <div class="media-content">
                      <div class="content type-${result.id} clickReply-${result.id}">
                      <strong>${user.displayName}</strong> <small>@${user.id}: ${result.createdAt.substring(0,10)}</small>
                        <div class="edit-area-${result.id}-0">
                          ${result.body}
                          <br>
                        </div>
                      </div>
                      <div class="retweet-reply-${result.id}-0"></div>
                      <div class="buttons-${result.id}-0">
                        <button class="button like-${result.id} is-info is-small">Like: ${result.likeCount}</button>
                        <button class="button retweet-${result.id}-0 is-info is-small">Retweet: ${result.retweetCount}</button>
                        <button class="button reply-${result.id}-0 is-info is-small">Reply: ${result.replyCount}</button>
                        <button class="button edit-${result.id}-0 is-info is-small">Edit</button>
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
          like(result, false);
          retweetButton(result, 0);
          replyButton(result, 0);
          editButton(result, 0);
          deleteButton(result);
          renderTweetReplies(result);
          imageToProfile(result.userId);
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
    $(`.replyField-${data.id}`).remove();
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

async function editUser(id, name, pass, avat, descript, curpass) {
    const result = await axios.put(`https://api.426twitter20.com/users/${id}`, {
      updatedPassword: pass,
      userId: id,
      displayName: name,
      avatar: avat,
      profileDescription: descript,
      currentPassword: curpass
      }, 
      {withCredentials: true});
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
