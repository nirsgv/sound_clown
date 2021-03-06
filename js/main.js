"use strict";

const Model = function () {
    this.currentTrackId = '';
    this.lastSearchedStrings = [];
    this.currentResults = [];
    this.batchSlice = 6;
    this.lastSearchesBatchSlice = 5;
    this.LAST_SEARCHED = 'sound_clown.lastSearched';
    this.nextHref = '';
    this.user_id = 'E8IqLGTYxHll6SyaM7LKrMzKveWkcrjg';
    this.defaultImg = "assets/img/soundcloud-logo.jpg";

    // checks local storage for 'last searches', sets it locally as an array
    this.init = () => {
        this.lastSearchedStrings = localStorage.getItem(this.LAST_SEARCHED)
            ? localStorage.getItem(this.LAST_SEARCHED).split(',')
            : [];
    };

    // uses 'getTracks' to fetch tracks from soundcloud's api using the search input content,
    // then prints results on dom.
    this.commitSearch =
        () => {
            const searchValue = view.searchGetInput.value;
            if (searchValue !== '') {
                this.getTracks(searchValue).then(view.printCurrentResults);
                controller.addSearchToList(searchValue);
                view.inputMessage.setAttribute('visible', 'false');
            } else {
                view.inputMessage.setAttribute('visible', 'true');
            }
        };

    // uses 'getTracks' to fetch tracks from soundcloud's api using the 'last results' printed on page,
    // then prints results on dom.
    this.commitSearchByLastSearchResult =
        (searchString) => {
            this.getTracks(searchString).then(view.printCurrentResults);
            view.dataDisplay.classList.add('displayed');
            view.searchDisplay.classList.remove('displayed');
        };

    // used to get next results, and set stage ready for next use of function.
    this.getTracks =
        (word) => {
            return SC.get('/tracks', {
                q: word,
                limit: this.batchSlice,
                linked_partitioning: 1
            }).then(function (res) {
                model.currentResults = res.collection;
                model.nextHref = res.next_href;
                view.nextHrefButton.href = model.nextHref;
                view.printCurrentResults(model.currentResults);
            });
        };

    // used to get next results, and set stage ready for next use of function.
    this.getNextBatch = function (event) {
        fetch(event.target.href, {
            method: 'get',
        })
            .then(res => res.json())
            .then(res => {
                model.currentResults = res.collection;
                model.nextHref = res.next_href;
                view.nextHrefButton.href = model.nextHref;
            })
            .then(() => view.printCurrentResults(model.currentResults));
    }
};

const View = function (model) {
    this.dataDisplay = document.getElementById("data_display");
    this.searchDisplay = document.getElementById("search_display");
    this.searchGetInput = document.getElementById("search_get_input");
    this.searchSubmitter = document.getElementById('search_submitter');
    this.imageHolder = document.getElementById('image-holder');
    this.inputMessage = document.getElementById('input_message');
    this.dataDisplayHeader = document.getElementById('data_display_header');
    this.searchDisplayHeader = document.getElementById('search_display_header');
    this.nextHrefButton = document.getElementById("fetch_next");
    this.tab_lis = document.querySelectorAll('[data-tab-id]');
    this.scIFrame = document.getElementById('sc-player');
    this.trackImage = document.querySelector('img#track-image');
    this.playChosen = document.querySelector('.play-chosen');
    this.soundCloudStrip = document.querySelector('.soundcloud-strip');

    this.init = () => {
        // set event handlers
        this.searchSubmitter.addEventListener('click', model.commitSearch, false);
        this.searchGetInput.addEventListener('change', model.commitSearch, false);
        this.dataDisplayHeader.addEventListener('click', this.toggleHeaderActive, false);
        this.searchDisplayHeader.addEventListener('click', this.toggleHeaderActive, false);
        this.nextHrefButton.addEventListener('click', model.getNextBatch, false);
        this.printLastSearches(model.lastSearchedStrings);

        // the elements with corresponding ids
        const tabs = Array.from(view.tab_lis)
            .map(t => document.getElementById(t.getAttribute('data-tab-id')));
        view.tab_lis.forEach((li, i) => {
            li.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('displayed'));
                tabs[i].classList.add('displayed');
            }, false)
        });
    };
    /**
     * Uses 'getBoundingClientRect' to return an element's center, horizontally and vertically,
     * returns an array of two items.
     * @param {DOM element} elem - an element from the DOM.
     */
    this.getCenter = (elem) => {
        const elemBoundRect = elem.getBoundingClientRect();
        const horCenter = elemBoundRect.left + (elemBoundRect.width / 2);
        const verCenter = elemBoundRect.top + (elemBoundRect.height / 2);
        return [horCenter, verCenter];
    };
    /**
     * Uses 'getBoundingClientRect' to return an element's left offset and top offset position,
     * returns an array of two items.
     * @param {DOM element} elem - an element from the DOM.
     */
    this.getOffset = (elem) => {
        const elemBoundRect = elem.getBoundingClientRect();
        console.log('elemBoundRect: ', elemBoundRect);
        const horOffset = elemBoundRect.left;
        const verOffset = elemBoundRect.top;
        return [horOffset, verOffset];
    };
    /**
     * Uses 'getBoundingClientRect' to return an element's width and height,
     * returns an array of two items.
     * @param {DOM element} elem - an element from the DOM.
     */
    this.getSize = (elem) => {
        const elemBoundRect = elem.getBoundingClientRect();
        const width = elemBoundRect.width;
        const height = elemBoundRect.height;
        return [width, height];
    };
    /**
     * Uses 'naturalHeight' to check if an image's width is bigger then it's height,
     * returns 'portrait-like' string value or an empty string value.
     * @param {DOM element} elem - an element from the DOM.
     */
    this.isElemWideOrTall = (elem) => {
        const height = elem.naturalHeight;
        const width = elem.naturalWidth;
        return height > width ? '' : 'portrait-like';
    };

    // toggles active state between 'current results' and 'last searches' headers.
    this.toggleHeaderActive = (event) => {
        if (event.target.id === "search_display_header") {
            view.dataDisplayHeader.classList.remove('active');
            view.searchDisplayHeader.classList.add('active');
        } else {
            view.searchDisplayHeader.classList.remove('active');
            view.dataDisplayHeader.classList.add('active');
        }
    };

    // takes an array, prints 'current results' on dom as list items.
    this.printCurrentResults = (tracks) => {
        view.dataDisplay.innerHTML =
            tracks.map(t =>
                `<li class="data-display__result" track-id="${t.id}" onclick="view.animateClonedIntoDestination(event,view.imageHolder,${t.id});">
                    <span class="data-display__link">${t.title}</span>
                </li>`).join('');
    };

    // takes an array, prints 'last searches' on dom as list items.
    this.printLastSearches = (lastSearchesList) => {
        view.searchDisplay.innerHTML = lastSearchesList
            .map((searchString, index, array) =>
                // todo: print the parameter as the argument for function
                `<li class="search-display__result" searchPar="${searchString}" onclick="model.commitSearchByLastSearchResult('${searchString}');view.toggleHeaderActive(event)">
                    <span class="search-display__link">${searchString}</span>
                </li>`).join('');
    };

    /**
     * animates a dom elements movement into a center of another dom element,
     * passes the destination element an id to be used for loading.
     * @param {event} event - origin of click event.
     * @param {DOM element} destinationElem - destination of animation.
     * @param {string} id - string representing id of track.
     */
    this.animateClonedIntoDestination = (event, destinationElem, id) => {
        const startPosition = view.getOffset(event.target),
            destination = view.getCenter(destinationElem),
            elemSize = view.getSize(event.target),
            clonedElemNode = event.target.cloneNode(true),
            uniqueId = Math.random().toFixed(6);
        clonedElemNode.classList.add('animated-cloned-element');
        clonedElemNode.setAttribute('id', uniqueId);
        clonedElemNode.setAttribute('style', `position:fixed;left:${startPosition[0]}px;top:${startPosition[1]}px;`);
        clonedElemNode.trackId = id;
        clonedElemNode.addEventListener('transitionend', view.cloneTransitionEnded, false);
        const realXcenter = destination[0] - elemSize[0] / 2;
        const realYcenter = destination[1] - elemSize[1] / 2;
        event.target.parentNode.append(clonedElemNode);
        const catchClonedElement = document.getElementById(uniqueId);
        window.setTimeout(function () {
            catchClonedElement.setAttribute('style', `position:fixed;left:${realXcenter}px;top:${realYcenter}px;`);
        }, 0);
    };

    this.cloneTransitionEnded = (event) => {
        controller.loadTrack(event.target.trackId);
        event.target.remove();
    }

};

const Controller = function (view) {
    this.init = () => {
        SC.initialize({client_id: model.user_id});
        controller.scPlayer = SC.Widget(view.scIFrame);
    };

    /**
     * Checks if searched value is present in an array which holds searched titles,
     * @param {string} tracks - Items collection.
     * @param {string} id - string representing id of track.
     */
    this.getTrackById =
        (tracks, id) => {
            return tracks.filter(track => track.id === id)[0];
        };
    /**
     * Checks if searched value is present in an array which holds searched titles,
     * if not present in array already, it adds it.
     * @param {string} searchValue - Name of search title.
     */
    this.addSearchToList =
        (searchValue) => {
            // check for duplicates failed, add to list, cut list for five items length in total
            if (model.lastSearchedStrings.indexOf(searchValue) === -1) {
                model.lastSearchedStrings.push(searchValue);
                const lastFiveSearches = model.lastSearchedStrings.slice(-1 * model.lastSearchesBatchSlice);
                model.lastSearchedStrings = lastFiveSearches;
                // check for duplicates passed, move item to last position
            } else {
                const hasElementPosition = model.lastSearchedStrings.indexOf(searchValue);
                const removedItem = model.lastSearchedStrings.splice(hasElementPosition, 1);
                model.lastSearchedStrings.push(removedItem[0]);
            }
            // set last searches in local storage
            window.localStorage.setItem(model.LAST_SEARCHED, model.lastSearchedStrings);
            // print last searches in dom
            view.printLastSearches(model.lastSearchedStrings);
        };
    /**
     * uses id to get item from current searched results, loads artwork and sets it ready to play.
     * @param {string} id - string id representing an item from a collection of tracks.
     */
    this.loadTrack =
        (id) => {
            const track = this.getTrackById(model.currentResults, id);
            view.trackImage.src = track.artwork_url || model.defaultImg;
            view.trackImage.classList.add(view.isElemWideOrTall(view.trackImage));
            view.trackImage.classList.add('animate-img-entrance');
            view.trackImage.addEventListener('animationend', this.animateImageEntranceEnded, false);
            model.currentTrackId = id;
            view.trackImage.trackId = id;
            view.imageHolder.addEventListener('click', this.playTrack, false);
            view.playChosen.classList.add('loaded-item');
        };
    /**
     * used to complement an 'animationend' event, removes a class-name from target, removes event-listener as well.
     * @param {event} event - event originator, in this case - a dom element.
     */
    this.animateImageEntranceEnded =
        (event) => {
            event.target.classList.remove('animate-img-entrance');
            view.trackImage.removeEventListener('animationend', this.animateImageEntranceEnded, false);
        };
    /**
     * loads item into player widget, responding to a click event, uses 'auto-play' on load.
     * @param {event} event - event originator, in this case - a dom element.
     */
    this.playTrack =
        (event) => {
            view.imageHolder.removeEventListener('click', this.playTrack, false);
            this.scPlayer.load(`https://api.soundcloud.com/tracks/${event.target.trackId}`, {auto_play: true});
            view.soundCloudStrip.classList.add('soundcloud-strip--loaded-item');
            view.playChosen.classList.remove('loaded-item');
        }
};


const model = new Model();
const view = new View(model);
const controller = new Controller(view);

document.addEventListener("DOMContentLoaded", model.init);
document.addEventListener("DOMContentLoaded", view.init);
document.addEventListener("DOMContentLoaded", controller.init);

