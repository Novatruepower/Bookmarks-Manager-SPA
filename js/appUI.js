//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
Init_UI();

function Init_UI() {
    renderBookmarks();
    $('#createBookmark').on("click", async function () {
        saveContentScrollPosition();
        rendercreateBookmarkForm();
    });
    $('#abort').on("click", async function () {
        renderBookmarks();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
}

function refreshCategories_Menu() {
    let ui = $("#categoriesMenu");
    ui.empty();
    ui.append(`<div class="dropdown-item categorie" id="categories">
                    <i class="menuIcon mx-2">&nbsp&nbsp&nbsp</i> Toutes les catégories
                </div>`);
    Init_Categories_Menu();
}


async function Init_Categories_Menu() {
    let categories = await Bookmarks_API.GetCategories();
    let ui = $("#categoriesMenu");
    if(categories.length > 0) {
        ui.append('<div class="dropdown-divider"></div>');
    }
    categories.forEach(categorie => {
        ui.append(`
        <div class="dropdown-item categorie" id="${categorie}">
            <i class="menuIcon mx-2">&nbsp&nbsp&nbsp</i> ${categorie}
        </div>`
        );
    });
    
    $(".categorie").on("click", function() {
        let checkedCategorie = $(".categorieCheck");
        checkedCategorie.removeClass("fa fa-check categorieCheck");
        checkedCategorie.html("&nbsp&nbsp&nbsp");

        let me = $(this);

        let children = me.children("i");
        children.text("");
        children.addClass("fa fa-check categorieCheck");

        let selectedCategorie = me.attr("id");
        renderBookmarks(selectedCategorie != "categories" ? selectedCategorie : null);
    });
}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Liste des favoris</h2>
                <hr>
                <p>
                    Petite application de gestion des favoris à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Mathis Brosseau
                </p>
                <p>
                    Code de base fourni par: Nicolas Chourot
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `))
}

function getSmallLogo(url) {
    return `<div class="favicon small" id="logo" style="background-image: url('https://www.google.com/s2/favicons?domain=${url}&sz=64');"></div>`;
}

function getBigLogo(url) {
    return `<div class="favicon big" id="logo" style="background-image: url('https://www.google.com/s2/favicons?domain=${url}&sz=64');"></div>`;
}

function getLocalBigLogo(url) {
    return `<div class="favicon big" id="logo" style="background-image: url('${url}');"></div>`;
}

async function renderBookmarks(categorie = null) {
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createBookmark").show();
    $("#abort").hide();
    let bookmarks = await Bookmarks_API.GetByCategorie(categorie);
    eraseContent();
    if (bookmarks !== null) {
        refreshCategories_Menu();

        bookmarks.forEach(bookmark => {
            $("#content").append(renderBookmark(bookmark));
        });
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditBookmarkForm(parseInt($(this).attr("editBookmarkId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteBookmarkForm(parseInt($(this).attr("deleteBookmarkId")));
        });

        let bookmarkRow = $(".bookmarkRow");

        bookmarkRow.on("click", function (e) { e.preventDefault(); })

        //https://www.w3schools.com/jquery/event_off.asp
        $("a").on("click", function (e) { bookmarkRow.off("click"); })
    } else {
        renderError("Service introuvable");
    }
}

function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message, isEraseContent = true) {
    if (isEraseContent)
    {
        eraseContent();
    }

    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function rendercreateBookmarkForm() {
    renderBookmarkForm();
}
async function renderEditBookmarkForm(id) {
    showWaitingGif();
    let bookmark = await Bookmarks_API.Get(id);
    if (bookmark !== null)
        renderBookmarkForm(bookmark);
    else
        renderError("Bookmark introuvable!");
}
async function renderDeleteBookmarkForm(id) {
    showWaitingGif();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let bookmark = await Bookmarks_API.Get(id);
    eraseContent();
    if (bookmark !== null) {
        $("#content").append(`
        <div class="bookmarkdeleteForm">
            <h4>Effacer le favori suivant?</h4>
            <br>
            <div class="bookmarkRow" bookmark_id=${bookmark.Id}">
                <div class="bookmarkContainer">
                    <div class="bookmarkLayout">
                        <div>
                            ${getSmallLogo(bookmark.Url)}
                            <span class="bookmarkTitle vertical-align">${bookmark.Title}</span>
                        </div>
            
                        <a target="_blank" href="${bookmark.Url}">${bookmark.Categorie}</a>
                    </div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteBookmark').on("click", async function () {
            showWaitingGif();
            let result = await Bookmarks_API.Delete(bookmark.Id);
            if (result)
                renderBookmarks();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderBookmarks();
        });
    } else {
        renderError("Favori introuvable!");
    }
}
function newBookmark() {
    bookmark = {};
    bookmark.Id = 0;
    bookmark.Title = "";
    bookmark.Url = "bookmark-logo.jpg";
    bookmark.Categorie = "";
    return bookmark;
}

function renderBookmarkForm(bookmark = null) {
    $("#createBookmark").hide();
    $("#abort").show();
    eraseContent();
    let create = bookmark == null;
    if (create) bookmark = newBookmark();
    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
        <form class="form" id="bookmarkForm">
            <input type="hidden" name="Id" value="${bookmark.Id}"/>
            ${create ? getLocalBigLogo(bookmark.Url) : getBigLogo(bookmark.Url)}
            <br>
            <br>

            <label for="Title" class="form-label bookmarkTitle">Titre </label>
            <input 
                class="form-control Alpha"
                name="Title" 
                id="Title" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrer un titre"
                InvalidMessage="Le titre comporte un caractère illégal" 
                value="${bookmark.Title}"
            />
            <label for="Url" class="form-label bookmarkUrl">Url </label>
            <input
                class="form-control URL"
                name="Url"
                id="Url"
                placeholder="Url"
                required
                RequireMessage="Veuillez entrer un url" 
                InvalidMessage="Veuillez entrer un url valide"
                value="${create ? "" : bookmark.Url}" 
            />
            <label for="Categorie" class="form-label bookmarkCategorie">Catégorie </label>
            <input 
                class="form-control Categorie"
                name="Categorie"
                id="Categorie"
                placeholder="Catégorie"
                required
                RequireMessage="Veuillez entrer une catégorie" 
                InvalidMessage="Veuillez entrer une catégorie valide"
                value="${bookmark.Categorie}"
            />
            <br>
            <input type="submit" value="Enregistrer" id="saveBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);

    initFormValidation();
    $('#bookmarkForm').on("submit", async function (event) {
        event.preventDefault();
        let bookmark = getFormData($("#bookmarkForm"));
        bookmark.Id = parseInt(bookmark.Id);
        showWaitingGif();
        let result = await Bookmarks_API.Save(bookmark, create);
        if (result)
            renderBookmarks();
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderBookmarks();
    });
    $("#Url").on("change", function() {
        let target = $(this).val();
        if (target == "")
            target = " ";

        $("#logo").css("background-image", `url("https://www.google.com/s2/favicons?domain=${target}&sz=64")`);
    });
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderBookmark(bookmark) {
    return $(`
     <div class="bookmarkRow" bookmark_id="${bookmark.Id}">
        <div class="bookmarkContainer noselect">
            <div class="bookmarkLayout">
            <div>
                ${getSmallLogo(bookmark.Url)}
                <span class="bookmarkTitle vertical-align">${bookmark.Title}</span>
            </div>

            <a target="_blank" href="${bookmark.Url}">${bookmark.Categorie}</a>
            
            </div>
            <div class="bookmarkCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editBookmarkId="${bookmark.Id}" title="Modifier ${bookmark.Title}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteBookmarkId="${bookmark.Id}" title="Effacer ${bookmark.Title}"></span>
            </div>
        </div>
    </div>           
    `);
}