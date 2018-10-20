"use strict";
//todo: divide loadTrack into load image src and load url
//todo: put all global variables into an IIFE
//todo: put all global variables into an IIFE

const model = {
    currentTrackId: '',
    initialBatch: 200,
    lastSearchedStrings: [],
    currentResults: [],
    batchSlice: 6,
    currentPagination: 0,
    paginationActivated: false,
    initiallySetSerchesFromLocalStorage: false,
    LAST_SEARCHED: 'sound_clown.lastSearched',
    init: () => {
        model.lastSearchedStrings = localStorage.getItem(model.LAST_SEARCHED)
                                  ? localStorage.getItem(model.LAST_SEARCHED).split(',')
                                  : [];
    },
    getTracks: (par) => {
        return SC.get('/tracks', {
            limit: model.initialBatch,
            q: par
        }).then(function (tracks) {
            model.currentResults = tracks;
            //console.log(model.currentResults);
            return Promise.resolve(tracks);
        });
    },
};



const view = {
    defaultImg: "assets/img/soundcloud-logo.jpg",
    dataDisplay:  document.querySelector("#data_display"),
    searchDisplay:  document.querySelector("#search_display"),
    searchGetInput: document.querySelector("#search_get_input"),
    searchSubmitter: document.querySelector('#search_submitter'),
    imageHolder: document.querySelector('#image-holder'),
    prevPaginate: document.querySelector('#prev'),
    nextPaginate: document.querySelector('#next'),
    inputMessage: document.querySelector('#input_message'),
    // the elements with 'data-tab-id' attribute
    tab_lis: document.querySelectorAll('[data-tab-id]'),
    init: () => {
        // set event handlers
        view.searchSubmitter.addEventListener('click', controller.commitSearch);
        view.searchGetInput.addEventListener('change', controller.commitSearch);
        view.imageHolder.addEventListener('click', controller.playTrack);
        view.prevPaginate.addEventListener('click', view.paginate);
        view.nextPaginate.addEventListener('click', view.paginate);

        view.printLastSearches(model.lastSearchedStrings);
        // the elements with corresponding ids
        const tabs = Array.from(view.tab_lis)
            .map(t=>document.getElementById(t.getAttribute('data-tab-id')));
                view.tab_lis.forEach((li, i)=> {
                li.addEventListener('click', ()=> {
                    tabs.forEach(t => t.classList.remove('displayed'));
                    tabs[i].classList.add('displayed');
            })
        });
    },
    /**
     * Slices a delivered collection by current pagination value and batch amount.
     * @param {array} items - A collection of tracks data items.
     */
    paginateResults: (items) => {
        const paginatedPos = model.currentPagination * model.batchSlice;
        return items.slice(paginatedPos, paginatedPos + model.batchSlice)
    },
    /**
     * Goes through the sliced amount by pagination of searched tracks,
     * builds list elements for the DOM and appends them.
     * @param {array} tracks - A collection of tracks data items.
     */
    printCurrentResults: (tracks) => {
        //console.table(tracks);
        view.dataDisplay.innerHTML = view.paginateResults(tracks)
            .map(t =>
                `<li class="data-display__result" track-id="${t.id}" onclick="view.animateClonedIntoDestination(event,view.imageHolder,${t.id});">
                    <span class="data-display__link">${t.title}</span>
                </li>`).join('');
        view.setPaginationUI();
    },

    printLastSearches: (lastSearchesList) => {
        console.log(lastSearchesList);
        view.searchDisplay.innerHTML = lastSearchesList
            .map((searchString, index, array) =>
                // todo: print the parameter as the argument for function
                `<li class="search-display__result" searchPar="${searchString}" onclick="controller.commitSearchByLastSearchResult('${searchString}');">
                    <span class="search-display__link">${searchString}</span>
                </li>`).join('');
    },
    animateClonedIntoDestination: (event,destinationElem,id) => {
        const startPosition = view.getOffset(event.target);
        const destination = view.getCenter(destinationElem);
        console.log(startPosition,destination);

        let clonedElemNode = event.target.cloneNode(true);
        clonedElemNode.classList.add('animated-cloned-element');
        const uniqueId=Math.random().toFixed(6);
        clonedElemNode.setAttribute('id',uniqueId);
        clonedElemNode.setAttribute('style', `position:fixed;left:${startPosition[0]}px;top:${startPosition[1]}px;`);
        //clonedElemNode.setAttribute('trackId', id);
        clonedElemNode.trackId = id;
        clonedElemNode.addEventListener('transitionend',view.transitionEnded);
        event.target.parentNode.append(clonedElemNode);
        const catchClonedElement = document.getElementById(uniqueId);
        window.setTimeout(function(){
            catchClonedElement.setAttribute('style', `position:fixed;left:${destination[0]}px;top:${destination[1]}px;`);
            },0);

    },
    transitionEnded: (event) => {
        controller.loadTrack(event.target.trackId);
        event.target.remove();
    },
    getCenter: (elem) => {
        const elemBoundRect = elem.getBoundingClientRect();
        const horCenter = elemBoundRect.left + (elemBoundRect.width/2);
        const verCenter = elemBoundRect.top + (elemBoundRect.height/2);
        return [horCenter,verCenter];
    },
    getOffset: (elem) => {
        const elemBoundRect = elem.getBoundingClientRect();
        const horOffset = elemBoundRect.left;
        const verOffset = elemBoundRect.top;
        return [horOffset,verOffset];
    },
    isElemWideOrTall: (elem) => {
        const height = elem.naturalHeight;
        const width = elem.naturalWidth;
        console.log([width,height]);
        return height > width ? '' : 'portrait-like';
    },
    setPaginationUI: () => {
        console.log('setPaginationUI started');
        if (model.currentResults.length < model.batchSlice){
            view.prevPaginate.setAttribute('disabled', '');
            view.nextPaginate.setAttribute('disabled', '');
        }
    },
    paginate: (e) => {
        console.dir(e.target.id);
        e.target.id==='next' ? model.currentPagination++ : model.currentPagination > 0  ? model.currentPagination-- : '';
        view.printCurrentResults(model.currentResults);
        console.log(model.currentPagination);
    }
};

const controller = {
    scIFrame: document.querySelector('#sc-player'),
    trackImage: document.querySelector('img#track-image'),
    user_id: 'E8IqLGTYxHll6SyaM7LKrMzKveWkcrjg',
    init: () => {
        SC.initialize({client_id: controller.user_id});
        controller.scPlayer = SC.Widget(controller.scIFrame);
        //controller.scPlayer.bind(SC.Widget.Events.READY, controller.onPlayReady)
        // console.log(controller);
    },
    onPlayReady:
        () => {
            console.log('player ready');
        },
    getTrackById:
        (tracks,id) => {
            return tracks.filter(track => track.id === id)[0];
        },
    commitSearch:
        () => {
            const searchValue = view.searchGetInput.value;
            //console.log(searchValue);
            if (searchValue !== '') {
                model.getTracks(searchValue).then(view.printCurrentResults);
                controller.addSearchToList(searchValue);
                view.inputMessage.setAttribute('visible','false');
            } else {
                view.inputMessage.setAttribute('visible','true');
            }
        },
    commitSearchByLastSearchResult:
        (searchString) => {
            //console.log(searchValue);
                model.getTracks(searchString).then(view.printCurrentResults);
        },
    /**
     * Checks if searched value is present in an array which holds searched titles,
     * if not present in array already, it adds it.
     * @param {string} searchValue - Name of search title.
     */
    addSearchToList:
        (searchValue) => {
        // check for duplicates failed, add to list
            if(model.lastSearchedStrings.indexOf(searchValue) ===  -1){
                model.lastSearchedStrings.push(searchValue);
                let lastFiveSearches = model.lastSearchedStrings.slice(-5);
                model.lastSearchedStrings = lastFiveSearches;
            // check for duplicates passed, move item to last position
            } else {
                const hasElementPosition = model.lastSearchedStrings.indexOf(searchValue);
                const removedItem = model.lastSearchedStrings.splice(hasElementPosition,1);
                model.lastSearchedStrings.push(removedItem[0]);
            }
            // set last searches in local storage
            window.localStorage.setItem(model.LAST_SEARCHED, model.lastSearchedStrings);
            // print last searches in dom
            view.printLastSearches(model.lastSearchedStrings);
        },
    loadTrack:
        (id) => {
            const track = controller.getTrackById(model.currentResults,id);
            controller.trackImage.src = track.artwork_url || view.defaultImg;

            controller.trackImage.classList.add(view.isElemWideOrTall(controller.trackImage));

            controller.trackImage.classList.add('animate-img-entrance');

            controller.trackImage.addEventListener('animationend',controller.animateImageEntranceEnded);
            model.currentTrackId = id;
            controller.trackImage.trackId = id;
        },
    animateImageEntranceEnded:
        (event) => {
            event.target.classList.remove('animate-img-entrance');
        },
    playTrack:
        (event) => {
            controller.scPlayer.load(`https://api.soundcloud.com/tracks/${event.target.trackId}`,{auto_play:true});
    }
};

document.addEventListener("DOMContentLoaded", model.init);
document.addEventListener("DOMContentLoaded", view.init);
document.addEventListener("DOMContentLoaded", controller.init);

