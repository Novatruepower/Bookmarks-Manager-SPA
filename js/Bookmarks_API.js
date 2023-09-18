class Bookmarks_API {
    static API_URL() { return "https://chlorinated-humdrum-blackcurrant.glitch.me/api/bookmarks" };

    static async GetCategories() {
        const categories = [];

        let bookmarks = await this.Get();

        bookmarks.forEach(bookmark => {
            let categorie = bookmark.Categorie;
            
            if (!categories.includes(categorie))
            {
                categories.push(categorie);
            }
        });
        return categories;
    }

    static async GetByCategorie(categorie = null) {
        const bookmarksArray = [];

        let bookmarks = await this.Get();

        if (categorie == null)
        {
            return bookmarks;
        }

        bookmarks.forEach(bookmark => {
            
            if (bookmark.Categorie === categorie)
            {
                bookmarksArray.push(bookmark);
            }
        });
        return bookmarksArray;
    }


    static async Get(id = null) {
        return new Promise(resolve => {
            $.ajax({
                url: this.API_URL() + (id != null ? "/" + id : ""),
                success: bookmarks => { resolve(bookmarks); },
                error: (xhr) => { console.log(xhr); resolve(null); }
            });
        });
    }
    static async Save(contact, create = true) {
        return new Promise(resolve => {
            $.ajax({
                url: this.API_URL(),
                type: create ? "POST" : "PUT",
                contentType: 'application/json',
                data: JSON.stringify(contact),
                success: (/*data*/) => { resolve(true); },
                error: (/*xhr*/) => { resolve(false /*xhr.status*/); }
            });
        });
    }
    static async Delete(id) {
        return new Promise(resolve => {
            $.ajax({
                url: this.API_URL() + "/" + id,
                type: "DELETE",
                success: () => { resolve(true); },
                error: (/*xhr*/) => { resolve(false /*xhr.status*/); }
            });
        });
    }
}