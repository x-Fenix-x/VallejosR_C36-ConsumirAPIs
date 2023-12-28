const $ = (id) => document.getElementById(id);

window.addEventListener('load', function () {
    const search = $('search');

    $('formSearch').addEventListener('submit', function (e) {
        e.preventDefault();

        let error = false;

        if (search.value.trim() === '') {
            error = true;
        }

        !error && this.submit();
    });
});
