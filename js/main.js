"use strict";

const model = {
    currentTrackId: '',
    batchDisplay: 6,
    renderedTracksBatch: 0,
    lastSearchedStrings: [],
    currentResults: [],
    getTracks: (par) => {
        return SC.get('/tracks', {
            //limit: model.batchDisplay,
            q: par
        }).then(function (tracks) {
            model.currentResults = tracks;
            console.log(model.currentResults);
            // view.printCurrentResults(model.currentResults);
            model.lastSearchedStrings.push(par);
            console.log(model.lastSearchedStrings);
            return Promise.resolve(tracks);
        });
    },
};



const view = {
    dataDisplay:  document.querySelector("#data_display"),

    printCurrentResults: (tracks) => {
        console.table(tracks);
        view.dataDisplay.innerHTML = tracks
            .map(t =>
                `<li class="data-display__result" track-id="${t.id}">
                    <a class="data-display__link" href="${t.id}">${t.title}</a>
                </li>`).join('');
    }
};

const controller = {

    searchGetInput: document.querySelector("#search_get_input"),
    searchSubmitter: document.querySelector('#search_submitter'),

    // the elements with 'data-tab-id' attribute
    tab_lis: document.querySelectorAll('[data-tab-id]'),

    user_id: 'E8IqLGTYxHll6SyaM7LKrMzKveWkcrjg',
    init: () => {
        SC.initialize({client_id: controller.user_id});
        // console.log(controller);

        // the elements with corresponding ids
        const tabs = Array.from(controller.tab_lis)
            .map(t=>document.getElementById(t.getAttribute('data-tab-id')));

        controller.tab_lis.forEach((li, i)=> {
            li.addEventListener('click', ()=> {
                tabs.forEach(t => t.classList.remove('displayed'));
                tabs[i].classList.add('displayed');
            })
        });

        // set event handlers
        //controller.searchSubmitter.onclick = controller.commitSearch;
        controller.searchSubmitter.addEventListener('click', controller.commitSearch);
        controller.searchGetInput.addEventListener('change', controller.commitSearch);
    },
    commitSearch:
        () => {
            let searchValue = controller.searchGetInput.value;
            console.log(searchValue);
            model.getTracks(searchValue).then(view.printCurrentResults);
        }
};

document.addEventListener("DOMContentLoaded", controller.init);

