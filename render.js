

//Javascript function to render someone's profile. Needs all their information passed in to view.
function renderProfile(profile) {
    
}

//Javascript function to render the users own profile. Comes with edit buttons and the ability to manipulate your profile.
function renderUserProfile(user) {

}

async function renderUserData(id, type, element) {
    $(`.${element}`).append(`<div class="${element}"></div>`);
    
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
                <div class="media-left"></div>
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
                      <div class="buttons">
                        <button class="button edit-${data.id} is-info is-small">Edit</button>
                        <button class="button retweet-${data.id} is-info is-small">  Retweet </button>
                        <button class="button reply-${data.id} is-info is-small">  Reply </button>
                        <button class="button delete-${data.id} is-danger is-small"> Delete </button>
                    </div>
                    </div>
                  </article>
                  
                </div>
                <div class="media-right">
                  <button class="delete"></button>
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
                          <div class="media-left"></div>
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
                          <div class="media-right">
                            <button class="delete"></button>
                          </div>
                        </article>
                    `);
                } else {
                    $(`.${element}`).append(`
                    <br>
                        <article class="media tweet-${data.id}">
                          <div class="media-left"></div>
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
                          <div class="media-right">
                            <button class="delete"></button>
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
                <div class="media-left"></div>
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
                      <div class="buttons">
                      <button class="button like-${data.id} is-info is-small">Like</button>
                      <button class="button retweet-${data.id} is-info is-small">  Retweet </button>
                      <button class="button reply-${data.id} is-info is-small">  Reply </button>
                    </div>
                    </div>
                  </article>
                  
                </div>
                <div class="media-right">
                  <button class="delete"></button>
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
                          <div class="media-left"></div>
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
                                        <p> Whoops, this tweet was deleted. Sorry for the inconviencence </p>
                                      </div>
                                    </article>
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
                          <div class="media-right">
                            <button class="delete"></button>
                          </div>
                        </article>
                    `);
                } else {
                    $(`.${element}`).append(`
                    <br>
                        <article class="media tweet-${data.id}">
                          <div class="media-left"></div>
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
                                            <br>
                                            ${parent.body}
                                          </p>
                                        </div>
                                      </div>
                                    </article>
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
                          <div class="media-right">
                            <button class="delete"></button>
                          </div>
                        </article>
                    `);
                }        
        }
    }

    if (data.isLiked) {
        $(`.like-${data.id}`).replaceWith(`<button class="button like-${data.id} is-info is-small">Liked</button>`)
    }


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

function tweetButton() {
    $(`.tweet`).on('click', async () => {
        $(`.tweet`).replaceWith(`
        
        <div class="field">
            <label class="label"></label>
        </div>
        `);
    });
}

function buttonSteup(data) {

}

$( async function () {
    await renderMainFeed();
});


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

async function like(id) {
    const result = await axios.post(`https://comp426finalbackendactual2.herokuapp.com/tweets/${id}/like`, {withCredentials: true});
    return result;
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
