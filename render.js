axios.defaults.withCredentials = true;

$( async function () {

  //getting current user but it's a user view
  const result = await axios({
      method: 'get',
      url: 'https://comp426finalbackendactual2.herokuapp.com/users/current',
      withCredentials: true,
  });

  console.log(result);

  //getting entire user object of current user
  
  const result2 = await axios({
      method: 'get',
      url: 'https://comp426finalbackendactual2.herokuapp.com/users/' + result.data.id,
      withCredentials: true,
  });

  console.log(result2);

  await renderMainFeed();

  //calling renderProfile to render current user's profile

  await renderUserProfile(result2.data);
  tweetButton();
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
            url: 'https://comp426finalbackendactual2.herokuapp.com//logout',
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

    if (data.isMine) {
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
                        <p class="edit-body-${data.id}">
                          <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                          <div class="retweetBox-${data.userId}"></div>
                          <br>
                          ${data.body}
                        </p>
                      </div>
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
                                    ${data.body}
                                    <br>
                                    <article class="media">
                                      <div class="media-content">
                                      <div class="retweetBox-${data.userId}"></div>
                                        <p> Whoops, this tweet was deleted. Sorry for the inconviencence </p>
                                      </div>
                                    </article>
                                  </p>
                                </div>
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
                                    <div class="retweetBox-${data.userId}"></div>
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
                                            <br>
                                            ${parent.body}
                                          </p>
                                        </div>
                                      </div>
                                    </article>
                                  </p>
                                </div>
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
                          <div class="retweetBox-${data.userId}"></div>
                          <br>
                          ${data.body}
                        </p>
                      </div>
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
                                  <p class>
                                    <strong>${user.displayName}</strong> <small>@${data.userId}</small>
                                    <div class="retweetBox-${data.userId}"></div>
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
                                            <br>
                                            ${parent.body}
                                          </p>
                                        </div>
                                      </div>
                                    </article>
                                  </p>
                                  <textarea class="input-bodies-${data.id}"></textarea>
                                </div>
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
    retweetButton(data.id)
    editButton(data)
    //deleteButton(data.id);
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
    `)
    await renderNewTweet("feed");

}

function editButton(data) {

  $(`.edit-${data.id}`).on('click', () => {
    $(`.columns`).append(`
    <div class="column edita-${data.id}">
      <div class="box is-info">
        <artice class="media">
          <div class="box">
            <textarea class="textarea final-${data.id}"> ${data.body} </textarea>
          </div>
          <button class="button is-info submit-${data.id}>Submit Edit</button>
        </article>
      </div>
    </div>
    `);

    $(`.edit-${data.id}`).replaceWith(`
      <button class="button edit-${data.id} is-info is-small">Edit</button>
    `);

    $(`.submit-${data.id}`).on('click', async () => {
      let final = $(`final-${data.id}`).val();

      await edit(data.id, final);

      $(`edits-${data.id}`).remove();
      editButton(data);
    });
  })

  
}

function retweetButton(data) {

  $(`.edit-${data.id}`).on('click', () => {
    $(`.columns`).append(`
    <div class="column edita-${data.id}">
      <div class="box is-info">
        <artice class="media">
          <div class="box">
            <textarea class="textarea final-${data.id}"> ${data.body} </textarea>
          </div>
          <button class="button is-info submit-${data.id}>Submit Edit</button>
        </article>
      </div>
    </div>
    `);

    $(`.edit-${data.id}`).replaceWith(`
      <button class="button edit-${data.id} is-info is-small">Edit</button>
    `);

    $(`.submit-${data.id}`).on('click', async () => {
      let final = $(`final-${data.id}`).val();

      await edit(data.id, final);

      $(`edits-${data.id}`).remove();
      editButton(data);
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

          let user = await getUser(result.userId);

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
                          <strong>${user.displayName}</strong> <small>@${result.userId}</small>
                          <div class="retweetBox-${result.userId}"></div>
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

        } else if ($(`#image`).is(`:checked`)) {
          
          const result = await axios.post(`https://comp426finalbackendactual2.herokuapp.com/tweets`, 
          {type: "tweet", body: $(`#tweetCreation`).val(), mediaType: "image", mediaId: $(`#link`).val() }, 
          {withCredentials: true});
        
          $(`.newTweet`).remove();

          let user = await getUser(result.userId);

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
                          <strong>${user.displayName}</strong> <small>@${result.userId}</small>
                          <div class="retweetBox-${result.userId}"></div>
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

        } else { 
          const result = await tweet($(`#tweetCreation`).val());

          $(`.newTweet`).remove();

          let user = await getUser(result.userId);

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
                          <strong>${user.displayName}</strong> <small>@${result.userId}</small>
                          <div class="retweetBox-${result.userId}"></div>
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
        }
      });

      $(`.begon`).on('click', () => {
        $(`#newTweet`).replaceWith(`
        <form class="level" id="newTweet">
          <button class="button is-primary tweet">Tweet</button>
        </form>
      `);
        tweetButton();
      });
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

async function retweet(id) {
    const result = await axios.post(`https://comp426finalbackendactual2.herokuapp.com/tweets`, {type: "retweet", body: text, parentId: id}, {withCredentials: true});
    return result;
}

async function reply(id, text) {
    const result = await axios.post(`https://comp426finalbackendactual2.herokuapp.com/tweets`, {type: "reply", body: text, parentId: id}, {withCredentials: true});
    return result;
}

async function edit(id, replacement) {
    const result = await axios.put(`https://comp426finalbackendactual2.herokuapp.com/tweets/${id}`, {body: `${replacement}`}, {withCredentials: true});
}

async function deleteTweet(id) {
    const result = await axios.delete(`https://comp426finalbackendactual2.herokuapp.com/tweets/recent/tweets/${id}`, {withCredentials: true});
}

async function recentTweets(){
    const result = await axios.get('https://comp426finalbackendactual2.herokuapp.com/tweets/recent', {withCredentials: true});
    return result.data;
}
