axios.defaults.withCredentials = true;

$( async function () {

  //getting current user but it's a user view
  const result = await currentUser();
  console.log(result);

  //getting entire user object of current user
  const result2 = await getUser(result.data.id);
  console.log(result2);

  await renderMainFeed();

  //calling renderProfile to render current user's profileS

  await renderUserProfile(result2.data);
  logoutButton()
});

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
                url: 'https://comp426finalbackendactual2.herokuapp.com/users/' + user.id,
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
                url: 'https://comp426finalbackendactual2.herokuapp.com/users/' + user.id,
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
                url: 'https://comp426finalbackendactual2.herokuapp.com/users/' + user.id,
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
            url: 'https://comp426finalbackendactual2.herokuapp.com/users/' + user.id,
            withCredentials: true,
        });

        //axios request again
        const result2 = await axios({
            method: 'get',
            url: 'https://comp426finalbackendactual2.herokuapp.com/logout',
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
async function renderNewTweet(element) {
    let data = await recentTweets();
    console.log(data.length);

    for (let i = 0; i < data.length; i++ ) {
        if (data[i] != {}) {
            await renderTweetBody(data[i], element);
        }
    }
}

async function renderTweetBody(data, element) {

    let user = await getUser(data.userId);

    console.log(data.type);

    if (data.isMine) {

        if(data.type == "tweet") {
          if(data.mediaType == "image") {
            $(`.${element}`).append(`
            <br>
            <article class="media tweet-${data.id}">
                <div class="box media-content">
                  <article class="media">
                    <figure class="media-left">
                      <p class="image is-64x64">
                        <img class="is-rounded" src="${user.avatar}">
                      </p>
                    </figure>
                    <div class="media-content">
                      <div class="content type-${data.userId}">
                        <p class>
                          <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                          <div class="edit-area-${data.id}">
                            ${data.body}
                          </div>
                        </p>
                      </div>
                      <div class="retweet-reply-${data.id}"></div>
                      <div class="buttons">
                        <button class="button edit-${data.id} is-info is-small">Edit</button>
                        <button class="button retweet-${data.id} is-info is-small">  Retweet </button>
                        <button class="button reply-${data.id} is-info is-small">  Reply </button>
                        <button class="button delete-${data.id} is-danger is-small"> Delete </button>
                    </div>
                    </div>
                  </article>
                  
                </div>
            </article>
            
            `);
          } else if (data.mediaType == "video") {
            $(`.${element}`).append(`
            <br>
              <article class="media tweet-${data.id}">
                  <div class="box media-content">
                    <article class="media">
                      <figure class="media-left">
                        <p class="image is-64x64">
                          <img class="is-rounded" src="${user.avatar}">
                        </p>
                      </figure>
                      <div class="media-content">
                        <div class="content type-${data.userId}">
                          <p class>
                            <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                            <br>
                              <div class="edit-area-${data.id}">
                              ${data.body}
                              </div>
                            <br>
                          </p>
                          <figure class="image is-16by9">
                            <iframe class="has-ratio" width="640" height="360" src="https://www.youtube.com/embed/${data.videoId}" frameborder="0" allowfullscreen></iframe>
                          </figure>
                        </div>
                        <div class="retweet-reply-${data.id}"></div>
                        <div class="buttons">
                        <button class="button like-${data.id} is-info is-small">Like</button>
                        <button class="button retweet-${data.id} is-info is-small">  Retweet </button>
                        <button class="button reply-${data.id} is-info is-small">  Reply </button>
                        </div>
                      </div>
                    </article>
                    
                  </div>
              </article>
            
            `);
          } else {
            $(`.${element}`).append(`
            <br>
            <article class="media tweet-${data.id}">
                <div class="box media-content">
                  <article class="media">
                    <figure class="media-left">
                      <p class="image is-64x64">
                        <img class="is-rounded" src="${user.avatar}">
                      </p>
                    </figure>
                    <div class="media-content">
                      <div class="content type-${data.userId}">
                        <p class="edit-body-${data.id}">
                          <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                          <div class="edit-area-${data.id}">
                            ${data.body}
                          </div>
                        </p>
                      </div>
                      <div class="retweet-reply-${data.id}"></div>
                      <div class="buttons">
                        <button class="button edit-${data.id} is-info is-small">Edit</button>
                        <button class="button retweet-${data.id} is-info is-small">  Retweet </button>
                        <button class="button reply-${data.id} is-info is-small">  Reply </button>
                        <button class="button delete-${data.id} is-danger is-small"> Delete </button>
                    </div>
                    </div>
                  </article>
                  
                </div>
            </article>
            
            `);
          }
            
        } else if (data.type == "retweet") {
    
            let parent = await getTweet(data.parentId);
            let userParent = await getUser(parent.userId);
    
                if (userParent == "Tweet has been deleted.") {
                    $(`.${element}`).append(`
                    <br>
                        <article class="media tweet-${data.id}">
                          <div class="box media-content">
                            <article class="media">
                              <figure class="media-left">
                                <p class="image is-64x64">
                                  <img class="is-rounded" src="${user.avatar}">
                                </p>
                              </figure>
                              <div class="media-content">
                                <div class="content type-${data.userId}">
                                  <p class="edit-body-${data.id}">
                                    <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                                    <div class="edit-area-${data.id}">
                                    ${data.body}
                                    </div>
                                    <br>
                                    <article class="media">
                                      <div class="media-content">
                                        <p> Whoops, this tweet was deleted. Sorry for the inconviencence </p>
                                      </div>
                                    </article>
                                  </p>
                                </div>
                                <div class="retweet-reply-${data.id}"></div>
                                <div class="buttons">
                                  <button class="button edit-${data.id} is-info is-small">Edit</button>
                                  <button class="button retweet-${data.id} is-info is-small">  Retweet </button>
                                  <button class="button reply-${data.id} is-info is-small">  Reply </button>
                                  <button class="button delete-${data.id} is-danger is-small"> Delete </button>
                              </div>
                              </div>
                            </article>
                            
                          </div>
                        </article>
                    `);
                } else if ( data.mediaType == "image" ) {
                  $(`.${element}`).append(`
                  <br>
                      <article class="media tweet-${data.id}">

                        <div class="box media-content">
                          <article class="media">
                            <figure class="media-left">
                              <p class="image is-64x64">
                                <img class="is-rounded" src="${user.avatar}">
                              </p>
                            </figure>
                            <div class="media-content">
                              <div class="content type-${data.userId}">
                                <p class>
                                  <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                                  <div class="edit-area-${data.id}">
                                    ${data.body}
                                  </div>
                                  <br>
                                  <article class="media">
                                    <figure class="media-left">
                                      <p class="image is-64x64">
                                        <img class="is-rounded" src="${userParent.avatar}">
                                      </p>
                                    </figure>
                                    <div class="media-content">
                                      <div class="content type-${parent.userId}">
                                        <p class>
                                          <strong>${userParent.displayName}</strong> <small>@${userParent.userId}</small>
                                          ${parent.body}
                                          <br>
                                          <figure class="image is-1by1">
                                            <img src="${parent.imageLink}">
                                          </figure>
                                        </p>
                                      </div>
                                    </div>
                                  </article>
                                </p>
                              </div>
                              <div class="retweet-reply-${data.id}"></div>
                              <div class="buttons">
                                <button class="button edit-${data.id} is-info is-small">Edit</button>
                                  <button class="button retweet-${data.id} is-info is-small">  Retweet </button>
                                  <button class="button reply-${data.id} is-info is-small">  Reply </button>
                                  <button class="button delete-${data.id} is-danger is-small"> Delete </button>
                              </div>
                            </div>
                          </article>
                          
                        </div>

                      </article>
                  `);
                
                } else if( data.mediaType == "video" ) { 
                  $(`.${element}`).append(`
                  <br>
                      <article class="media tweet-${data.id}">

                        <div class="box media-content">
                          <article class="media">
                            <figure class="media-left">
                              <p class="image is-64x64">
                                <img class="is-rounded" src="${user.avatar}">
                              </p>
                            </figure>
                            <div class="media-content">
                              <div class="content type-${data.userId}">
                                <p class>
                                  <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                                  <div class="retweetBox-${data.userId}"></div>
                                  <div class="edit-area-${data.id}">
                                    ${data.body}
                                  </div>
                                  <br>
                                  <article class="media">
                                    <figure class="media-left">
                                      <p class="image is-64x64">
                                        <img class="is-rounded" src="${userParent.avatar}">
                                      </p>
                                    </figure>
                                    <div class="media-content">
                                      <div class="content type-${parent.userId}">
                                        <p>
                                          <strong>${userParent.displayName}</strong> <small>@${userParent.userId}</small>
                                          <div>
                                          ${parent.body}
                                          </div>
                                        </p>
                                        <figure class="image is-16by9">
                                          <iframe class="has-ratio" width="640" height="360" src="https://www.youtube.com/embed/${parent.videoId}" frameborder="0" allowfullscreen></iframe>
                                        </figure>
                                      </div>
                                    </div>
                                  </article>
                                </p>
                              </div>
                              <div class="retweet-reply-${data.id}"></div>
                              <div class="buttons">
                              <button class="button edit-${data.id} is-info is-small">Edit</button>
                                  <button class="button retweet-${data.id} is-info is-small">  Retweet </button>
                                  <button class="button reply-${data.id} is-info is-small">  Reply </button>
                                  <button class="button delete-${data.id} is-danger is-small"> Delete </button>
                            </div>
                            </div>
                          </article>
                          
                        </div>

                      </article>
                  `);

                } else {
                    $(`.${element}`).append(`
                    <br>
                        <article class="media tweet-${data.id}">
                          <div class="box media-content">
                            <article class="media">
                              <figure class="media-left">
                                <p class="image is-64x64">
                                  <img class="is-rounded" src="${user.avatar}">
                                </p>
                              </figure>
                              <div class="media-content">
                                <div class="content type-${data.userId}">
                                  <p class="edit-body-${data.id}">
                                    <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                                    <div class="edit-area-${data.id}">
                                    ${data.body}
                                    </div>
                                    <br>
                                    <article class="media">
                                      <figure class="media-left">
                                        <p class="image is-64x64">
                                          <img class="is-rounded" src="${userParent.avatar}">
                                        </p>
                                      </figure>
                                      <div class="media-content">
                                        <div class="content type-${parent.userId}">
                                          <p>
                                            <strong>${userParent.displayName}</strong> <small>@${userParent.userId}</small>
                                            ${parent.body}
                                          </p>
                                        </div>
                                      </div>
                                    </article>
                                  </p>
                                </div>
                                <div class="retweet-reply-${data.id}"></div>
                                <div class="buttons">
                                  <button class="button edit-${data.id} is-info is-small">Edit</button>
                                  <button class="button retweet-${data.id} is-info is-small">  Retweet </button>
                                  <button class="button reply-${data.id} is-info is-small">  Reply </button>
                                  <button class="button delete-${data.id} is-danger is-small"> Delete </button>
                              </div>
                              </div>
                            </article>
                            
                          </div>
                        </article>
                    `);
                }        
        }
    } else {
        if(data.type == "tweet") {
            $(`.${element}`).append(`
            <br>
            <article class="media tweet-${data.id}">
                <div class="box media-content">
                  <article class="media">
                    <figure class="media-left">
                      <p class="image is-64x64">
                        <img class="is-rounded" src="${user.avatar}">
                      </p>
                    </figure>
                    <div class="media-content">
                      <div class="content type-${data.userId}">
                        <p class>
                          <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                          <br>
                          ${data.body}
                        </p>
                      </div>
                      <div class="retweet-reply-${data.id}"></div>
                      <div class="buttons">
                      <button class="button like-${data.id} is-info is-small">Like</button>
                      <button class="button retweet-${data.id} is-info is-small">  Retweet </button>
                      <button class="button reply-${data.id} is-info is-small">  Reply </button>
                    </div>
                    </div>
                  </article>
                  
                </div>
            </article>
            
            `);

        } else if (data.type == "tweet" && data.mediaType == "video") {

          $(`.${element}`).append(`
          <br>
            <article class="media tweet-${data.id}">
                <div class="box media-content">
                  <article class="media">
                    <figure class="media-left">
                      <p class="image is-64x64">
                        <img class="is-rounded" src="${user.avatar}">
                      </p>
                    </figure>
                    <div class="media-content">
                      <div class="content type-${data.userId}">
                        <p class>
                          <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                          <br>
                          ${data.body}
                          <br>
                        </p>
                        <figure class="image is-16by9">
                          <iframe class="has-ratio" width="640" height="360" src="https://www.youtube.com/embed/${data.videoId}" frameborder="0" allowfullscreen></iframe>
                        </figure>
                      </div>
                      <div class="retweet-reply-${data.id}"></div>
                      <div class="buttons">
                      <button class="button like-${data.id} is-info is-small">Like</button>
                      <button class="button retweet-${data.id} is-info is-small">  Retweet </button>
                      <button class="button reply-${data.id} is-info is-small">  Reply </button>
                      </div>
                    </div>
                  </article>
                  
                </div>
            </article>
          
          `);

        } else if (data.type == "tweet" && data.mediaType == "image") {

          $(`.${element}`).append(`
          <br>
            <article class="media tweet-${data.id}">
                <div class="box media-content">
                  <article class="media">
                    <figure class="media-left">
                      <p class="image is-64x64">
                        <img class="is-rounded" src="${user.avatar}">
                      </p>
                    </figure>
                    <div class="media-content">
                      <div class="content type-${data.userId}">
                        <p class>
                          <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                          ${data.body}
                        <br>
                      </p>
                      <figure class="image is-1by1">
                        <img src="${data.imageLink}">
                      </figure>
                    </div>
                    <div class="retweet-reply-${data.id}"></div>
                    <div class="buttons">
                    <button class="button like-${data.id} is-info is-small">Like</button>
                    <button class="button retweet-${data.id} is-info is-small">  Retweet </button>
                    <button class="button reply-${data.id} is-info is-small">  Reply </button>
                    </div>
                  </div>
                </article>
                
              </div>
          </article>
          `)          

        } else if (data.type == "retweet") {
    
            let parent = await getTweet(data.parentId);
            let userParent = await getUser(parent.userId);
    
                if (userParent == "Tweet has been deleted.") {
                    $(`.${element}`).append(`
                    <br>
                        <article class="media tweet-${data.id}">
                          <div class="box media-content">
                            <article class="media">
                              <figure class="media-left">
                                <p class="image is-64x64">
                                  <img class="is-rounded" src="${user.avatar}">
                                </p>
                              </figure>
                              <div class="media-content">
                                <div class="content type-${data.userId}">
                                  <p>
                                    <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                                    <div class="retweetBox-${data.userId}"></div>
                                    ${data.body}
                                    <br>
                                    <article class="media">
                                      <div class="media-content">
                                        <p> Whoops, this tweet was deleted. Sorry for the inconviencence </p>
                                      </div>
                                    </article>
                                  </p>
                                  <textarea class="input-bodies-${data.id}"></textarea>
                                </div>
                                <div class="retweet-reply-${data.id}"></div>
                                <div class="buttons">
                                <button class="button like-${data.id} is-info is-small">Like</button>
                                <button class="button retweet-${data.id} is-info is-small">  Retweet </button>
                                <button class="button reply-${data.id} is-info is-small">  Reply </button>
                              </div>
                              </div>
                            </article>
                            
                          </div>
                        </article>
                    `);
                } else if (parent.mediaType != "video" && parent.mediaType != "image") {
                    $(`.${element}`).append(`
                    <br>
                        <article class="media tweet-${data.id}">

                          <div class="box media-content">
                            <article class="media">
                              <figure class="media-left">
                                <p class="image is-64x64">
                                  <img class="is-rounded" src="${user.avatar}">
                                </p>
                              </figure>
                              <div class="media-content">
                                <div class="content type-${data.userId}">
                                  <p class>
                                    <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                                    ${data.body}
                                    <br>
                                    <article class="media">
                                      <figure class="media-left">
                                        <p class="image is-64x64">
                                          <img class="is-rounded" src="${userParent.avatar}">
                                        </p>
                                      </figure>
                                      <div class="media-content">
                                        <div class="content type-${parent.userId}">
                                          <p class>
                                            <strong>${userParent.displayName}</strong> <small>@${userParent.userId}</small>
                                            ${parent.body}
                                            <br>
                                          </p>
                                        </div>
                                      </div>
                                    </article>
                                  </p>
                                </div>
                                <div class="retweet-reply-${data.id}"></div>
                                <div class="buttons">
                                <button class="button like-${data.id} is-info is-small">Like</button>
                                <button class="button retweet-${data.id} is-info is-small">  Retweet </button>
                                <button class="button reply-${data.id} is-info is-small">  Reply </button>
                              </div>
                              </div>
                            </article>
                            
                          </div>

                        </article>
                    `);
                } else if ( parent.mediaType == "video" ) {
                  $(`.${element}`).append(`
                    <br>
                        <article class="media tweet-${data.id}">

                          <div class="box media-content">
                            <article class="media">
                              <figure class="media-left">
                                <p class="image is-64x64">
                                  <img class="is-rounded" src="${user.avatar}">
                                </p>
                              </figure>
                              <div class="media-content">
                                <div class="content type-${data.userId}">
                                  <p class>
                                    <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                                    ${data.body}
                                    <br>
                                    <article class="media">
                                      <figure class="media-left">
                                        <p class="image is-64x64">
                                          <img class="is-rounded" src="${userParent.avatar}">
                                        </p>
                                      </figure>
                                      <div class="media-content">
                                        <div class="content type-${parent.userId}">
                                          <p class>
                                            <strong>${userParent.displayName}</strong> <small>@${userParent.userId}</small>
                                            ${parent.body}
                                          </p>
                                          <figure class="image is-16by9">
                                            <iframe class="has-ratio" width="640" height="360" src="https://www.youtube.com/embed/${parent.videoId}" frameborder="0" allowfullscreen></iframe>
                                          </figure>
                                        </div>
                                      </div>
                                    </article>
                                  </p>
                                  
                                </div>
                                <div class="retweet-reply-${data.id}"></div>
                                <div class="buttons">
                                <button class="button like-${data.id} is-info is-small">Like</button>
                                <button class="button retweet-${data.id} is-info is-small">  Retweet </button>
                                <button class="button reply-${data.id} is-info is-small">  Reply </button>
                              </div>
                              </div>
                            </article>
                            
                          </div>

                        </article>
                    `);
                  
                } else if ( parent.mediaType == "image" ) {
                  $(`.${element}`).append(`
                  <br>
                      <article class="media tweet-${data.id}">

                        <div class="box media-content">
                          <article class="media">
                            <figure class="media-left">
                              <p class="image is-64x64">
                                <img class="is-rounded" src="${user.avatar}">
                              </p>
                            </figure>
                            <div class="media-content">
                              <div class="content type-${data.userId}">
                                <p class>
                                  <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                                  ${data.body}
                                  <br>
                                  <article class="media">
                                    <figure class="media-left">
                                      <p class="image is-64x64">
                                        <img class="is-rounded" src="${userParent.avatar}">
                                      </p>
                                    </figure>
                                    <div class="media-content">
                                      <div class="content type-${parent.userId}">
                                        <p class>
                                          <strong>${userParent.displayName}</strong> <small>@${userParent.userId}</small>
                                          ${parent.body}
                                          <br>
                                          <figure class="image is-1by1">
                                            <img src="${parent.imageLink}">
                                          </figure>
                                        </p>
                                      </div>
                                    </div>
                                  </article>
                                </p>
                              </div>
                              <div class="retweet-reply-${data.id}"></div>
                              <div class="buttons">
                              <button class="button like-${data.id} is-info is-small">Like</button>
                              <button class="button retweet-${data.id} is-info is-small">  Retweet </button>
                              <button class="button reply-${data.id} is-info is-small">  Reply </button>
                            </div>
                            </div>
                          </article>
                          
                        </div>

                      </article>
                  `);
                }
        }
    }

    like(data.id, !(data.isLiked));
    editButton(data);
    retweetButton(data);
    replyButton(data);
    deleteButton(data);
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

    await renderNewTweet("feed");

}

function editButton(data) {

  $(`.edit-${data.id}`).on('click', () => {
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

    $(`.edit-${data.id}`).replaceWith(`
      <button class="button edit-${data.id} is-info is-small">edit</button>
    `);

    $(`.submit-edit-${data.id}`).on('click', async () => {
      let final = $(`.replace-${data.id}`).val();

      await edit(data.id, final);

      $(`.edits-area-${data.id}`).replaecWith(`
        <div class="edit-area-${data.id}>
          ${final}
        </div>
      `);
      editButton(data);
    });

    $(`.cancel-edit-${data.id}`).on('click', () => {
      let final = $(`.replace-${data.id}`).val();

      $(`edits-area-${data.id}`).replaecWith(`
        <div class="edit-area-${data.id}>
          ${final}
        </div>
      `);
      editButton(data);
    })
  })

  
}

function retweetButton(data) {

  $(`.retweet-${data.id}`).on('click', () => {
    $(`.retweet-reply-${data.id}`).replaceWith(`
      <div class="retweet-reply-${data.id}>
        <div class="field">
          <div class="contianer">
            <textarea class="retweet-body-${data.id}"></textarea>
          </div>
        </div>
        <div class="retweet-buttons-${data.id}">
          <button class="button retweet-submit-${data.id} is-info is-small" type="button">Submit Retweet</button>
          <button class="button retweet-cancel-${data.id} is-danger is-small" type="button"> Cancel </button>
        </div>
      </div>
    `);

    $(`.retweet-${data.id}`).replaceWith(`
      <button class="button retweet-${data.id} is-info is-small">retweet</button>
    `);

    $(`.retweet-submit-${data.id}`).on('click', async () => {
      let final = $(`retweet-body-${data.id}`).val();

      await retweet(data.id, final);

      $(`retweet-reply-${data.id}`).replaceWith(`
      <div class="retweet-reply-${data.id}></div>
      `);
      retweetButton(data);
    });


    $(`.retweet-cancel-${data.id}`).on('click', () => {
      $(`retweet-reply-${data.id}`).replaceWith(`
        <div class="retweet-reply-${data.id}></div>
      `);
    });
  })

  
}

function replyButton(data) {
  $(`.reply-${data.id}`).on('click', () => {
    $(`.retweet-reply-${data.id}`).replaceWith(`
      <div class="retweet-reply-${data.id}>
      <textarea class="reply-body-${data.id}"></textarea>
      <div class="reply-buttons-${data.id}">
        <button class="button reply-submit-${data.id} is-info is-small" type="button">Submit Reply</button>
        <button class="button reply-cancel-${data.id} is-danger" type="button"> Cancel </button>
      </div>
    </div>
    `);

    $(`.reply-${data.id}`).replaceWith(`
      <button class="button retweet-${data.id} is-info is-small">reply</button>
    `);

    $(`.reply-submit-${data.id}`).on('click', async () => {
      let final = $(`reply-body-${data.id}`).val();

      await reply(data.id, final);

      $(`retweet-reply-${data.id}`).replaceWith(`
      <div class="retweet-reply-${data.id}></div>
      `);
      retweetButton(data);
    });


    $(`.reply-cancel-${data.id}`).on('click', () => {
      $(`retweet-reply-${data.id}`).replaceWith(`
        <div class="retweet-reply-${data.id}></div>
      `);
    });
  })
}


function tweetButton() {
  $(`.tweet`).on('click', () => {
      $(`#newTweet`).replaceWith(`
      
      <form class="fillout box newTweet">
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
        if($(`#video`).is(`:checked`)) {
          let link = $(`#link`).val().substring(32,43);

          const result = await axios.post(`https://comp426finalbackendactual2.herokuapp.com/tweets`, 
          {type: "tweet", body: $(`#tweetCreation`).val(), mediaType: "video", mediaId: link }, {withCredentials: true});

          $(`.newTweet`).remove();

          let user = await currentUser();
          result = await getTweet(user.postedTweets[0]);

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
                        <p class>
                          <strong>${user.displayName}</strong> <small>@${user.id}</small>
                          <br>
                          ${result.body}
                          <br>
                        </p>
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

          $(`.feed`).prepend(`
            <form class="level" id="newTweet">
              <button class="button is-primary tweet">Tweet</button>
            </form>
          `);

          tweetButton();
          retweetButton(result)
          editButton(result)
          deleteButton(result);

        } else if ($(`#image`).is(`:checked`)) {
          
          const result = await axios.post(`https://comp426finalbackendactual2.herokuapp.com/tweets`, 
          {type: "tweet", body: $(`#tweetCreation`).val(), mediaType: "image", mediaId: $(`#link`).val() }, 
          {withCredentials: true});
        
          $(`.newTweet`).remove();

          let user = await currentUser();
          result = await getTweet(user.postedTweets[0]);


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
                        <p class>
                          <strong>${user.displayName}</strong> <small>@${user.id}</small>
                          <br>
                          ${result.body}
                          <br>
                        </p>
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

          $(`.feed`).prepend(`
            <form class="level" id="newTweet">
              <button class="button is-primary tweet">Tweet</button>
            </form>
          `);

          tweetButton();
          retweetButton(result)
          editButton(result)
          deleteButton(result);

        } else { 
          const result = await tweet($(`#tweetCreation`).val());

          $(`.newTweet`).remove();

          let user = await currentUser();
          result = await getTweet(user.postedTweets[0]);
          
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
                        <p class>
                          <strong>${user.displayName}</strong> <small>@${user.id}</small>
                          <br>
                          ${result.body}
                          <br>
                        </p>
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

          $(`.feed`).prepend(`
            <form class="level" id="newTweet">
              <button class="button is-primary tweet">Tweet</button>
            </form>
          `);

          tweetButton();
          retweetButton(result)
          editButton(result)
          deleteButton(result);
        }
      });

      $(`#begon`).on('click', () => {
        $(`#newTweet`).replaceWith(`
        <form class="level" id="newTweet">
          <button class="button is-primary tweet">Tweet</button>
        </form>
      `);
        tweetButton();
      });
  });
}

function deleteButton(data) {
  $(`delete-${data.id}`).on(`click`, async () => {
    await deleteTweet(data.id);
    $(`tweet-${data.id}`).remove();
  });
}

function logoutButton() {
  $(`.logout`).on(`click`, async () => {
    await logout();
    window.location.replace("loginPage.html");
  });
}

function resetPage() {
  $(`#reset-page`).on('click', async () => {
    $(`.column`).remove();

    await renderMainFeed();
  });
}

async function getTweet(id) {
    const result = await axios.get(`https://comp426finalbackendactual2.herokuapp.com/tweet/${id}`, {withCredentials: true})
    return result.data;
}

async function logout() {
    const result = await axios.get(`https://comp426finalbackendactual2.herokuapp.com/logout`, {withCredentials: true});
}

async function getUser(id) {
    const result = await axios.get(`https://comp426finalbackendactual2.herokuapp.com/users/${id}`,
    {}, {withCredentials: true});

    return result.data;
}

async function deleteUser(id) {
    const result = await axios.delete(`https://comp426finalbackendactual2.herokuapp.com/users/${id}`, {withCredentials: true});
}

async function editUser(id, name, pass, avat, descript) {
    const result = await axios.put(`https://comp426finalbackendactual2.herokuapp.com/users/${id}`, {displayName: name,
    password: pass,
    avatar: avat,
    profileDescription: descript}, {withCredentials: true});
}

function like(id, liked) {

    if(liked) {
        $(`.like-${id}`).replaceWith(`<button class="button like-${id} is-info is-small">Liked</button>`)
        
        $(`.like-${id}`).on('click', async function() {
            const result = await axios.post(`https://comp426finalbackendactual2.herokuapp.com/tweets/${id}/like`, {withCredentials: true});
            like(id, !(liked)); 
        });
    } else {
        $(`.like-${id}`).replaceWith(`<button class="button like-${id} is-info is-small">Like</button>`)
        
        $(`.like-${id}`).on('click', async function() {
            const result = await axios.post(`https://comp426finalbackendactual2.herokuapp.com/tweets/${id}/like`, {withCredentials: true});
            like(id, !(liked));
        });
    }
}

async function tweet(text) {
    const result = await axios.post(`https://comp426finalbackendactual2.herokuapp.com/tweets`, {type: "tweet", body: text}, {withCredentials: true});
    return result;
}

async function retweet(id, text) {
    const result = await axios.post(`https://comp426finalbackendactual2.herokuapp.com/tweets`, {type: "retweet", body: text, parentId: id}, {withCredentials: true});
    return result;
}

async function reply(id, text) {
    const result = await axios.post(`https://comp426finalbackendactual2.herokuapp.com/tweets`, {type: "reply", body: text, parentId: id}, {withCredentials: true});
    return result;
}

async function edit(id, replacement, type, IdMedia) {
    const result = await axios.put(`https://comp426finalbackendactual2.herokuapp.com/tweets/${id}`, {body: `${replacement}`, mediaType: type, mediaId: IdMedia}, {withCredentials: true});
}

async function deleteTweet(id) {
    const result = await axios.delete(`https://comp426finalbackendactual2.herokuapp.com/tweets/recent/tweets/${id}`, {withCredentials: true});
}

async function recentTweets(){
    const result = await axios.get('https://comp426finalbackendactual2.herokuapp.com/tweets/recent', {withCredentials: true});
    return result.data;
}

async function currentUser() {
  const result = await axios({
    method: 'get',
    url: 'https://comp426finalbackendactual2.herokuapp.com/users/current',
    withCredentials: true,
  });

  return result;
}
