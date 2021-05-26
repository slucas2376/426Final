axios.defaults.withCredentials = true;

$( function() {
    localStorage.clear()
    signIn();
});

function signIn() {
    $(`#enter`).on('click', async () => {

        let userName = $('#signup').val();
        let password = $('#pass').val();
        let result;
        try {
            result = await login(userName, password);
        } catch (error) {
            $(`#warning`).replaceWith(`<p class="has-text-centered has-text-danger"> Sign in didn't work, your password or user id was incorrect or not registered </p>`);
            return false;
        }
        localStorage.setItem('uid', userName)
        window.location.replace("mainpage.html");
        return true;
    });

    $(`#new-guy`).on('click', () => {
        $(`#sign-in`).replaceWith(`
        <div id="sign-in">
        <h1 class="title has-texted-centered">
        Account Creation
    </h1>
    <h2 class="subtitle">
        Be a little Mature about names here please.
    </h2>
    <hr class="login-hr">
    <form class="fillout box">
        <div class="field">
            <label class="label">UserId</label>
            <div class="control">
                <input id="id" class="input" type="text" placeholder="Custom Profile Id">
            </div>
        </div>

        <div class="field">
            <div class="control">
                <label class="label">User Name</label>
                <input id="name" class="input" type="text" placeholder="People will see this one">
            </div>
        </div>

        <div class="field">
            <div class="control">
                <label class="label">Password</label>
                <input id="pass" class="input" type="text" placeholder="Your new Passowrd">
            </div>
        </div>

        <div class="field">
            <div class="control">
                <label class="label">Avatar</label>
                <input id="avat" class="input" type="text" placeholder="120 character or less image link">
            </div>
        </div>
        <div class="field">
            <div class="control">
                <p id="warning" class="has-text-centered has-text-danger"></p>
            </div>
        </div>
        <div class="field is-grouped is-grouped-centered">
            <p class="control">
                <a id="start" class="button is-info">
                    Get Started
                </a>
            </p>
            <p class="control">
                <a id="cancel" class="button is-danger">
                    Back to Login
                </a>
            </p>
        </div>
    </form>
    </div>`);
    
        $(`#start`).on('click', async () => {

            try {
                let result = await register(`${$(`#id`).val()}`, `${$(`#name`).val()}`, `${$(`#pass`).val()}`, `${$(`#avat`).val()}`);
            } catch (error) {
                $(`#warning`).replaceWith(`<p class="has-text-centered has-text-danger"> Make sure your userid is not already in your use.</p>`);
                return false;
            }
            
            localStorage.setItem('uid', $(`#id`).val());
            window.location.replace("mainpage.html");
            return true;
        });

        $('#cancel').on('click', () => {
            $(`#sign-in`).replaceWith(`
                    <div id="sign-in">
                        <h1 class="title">
                            Welcome to your Personalized Twitter
                        </h1>
                        <h2 class="subtitle">
                            Made by Owen, Sophia
                        </h2>
                        <hr class="login-hr">
                        <form class="fillout box">
                            <div class="field">
                                <label class="label  has-text-centered">Welcome!</label>
                                <label class="label">User</label>
                                <div class="control">
                                    <input id="signup" class="input" type="text" placeholder="User Name">
                                </div>
                            </div>
                
                            <div class="field">
                                <div class="control">
                                    <label class="label">Password</label>
                                    <input id="pass" class="input" type="text" placeholder="password">
                                </div>
                            </div>
                            <div class="field">
                                <div class="control">
                                    <p id="warning" class="has-text-centered has-text-danger"></p>
                                </div>
                            </div>
                            <div class="field is-grouped is-grouped-centered">
                                <p class="control">
                                    <a id="enter" class="button is-info">
                                        Sign in
                                    </a>
                                </p>
                                <p class="control">
                                    <a id="new-guy" class="button is-danger">
                                        New Account
                                    </a>
                                </p>
                            </div>
                        </form>
                    </div>
            `);

            signIn();
        });

    })
}

async function register(id, name, pass, avat) {
    const result = await axios.post('https://api.426twitter20.com/register',
        {userId: id,
        displayName: name,
        password: pass,
        avatar: avat}, {withCredentials: true});
}

async function login(id, pass) {
    const result = await axios.post(`https://api.426twitter20.com/login`,
        {
            userId: id,
            password: pass
        },
        {withCredentials: true}
    );

    return result;

}
