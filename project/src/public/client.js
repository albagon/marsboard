let store = Immutable.Map({
    user: Immutable.Map({ name: "Student" }),
    roversList: Immutable.List(['curiosity', 'opportunity', 'spirit']),
    rovers: Immutable.Map({ curiosity: Immutable.Map({ }),
                            opportunity: Immutable.Map({ }),
                            spirit: Immutable.Map({ })
                          })
})

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (newState) => {
    store = store.mergeDeep(newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {

    return `
        <header></header>
        <main>
            ${Greeting(state.getIn(['user', 'name']))}
            <section>
                <p>Thanks to the NASA APIs available, we have access to NASA data,
                including imagery. Here you can find the most recent data from the
                rovers on Mars. For more information, please visit the
                <a href="https://api.nasa.gov/" target="_blank">api.nasa.gov</a>
                catalog, it is constantly growing.</p>
                <p>Choose between ${AddButtons(state.get('roversList'))} rovers
                to see more details about their trips and latest photos.</p>
                ${AddRover(state.get('rovers'), state.get('roversList').get(0))}
                ${AddRover(state.get('rovers'), state.get('roversList').get(1))}
                ${AddRover(state.get('rovers'), state.get('roversList').get(2))}
            </section>
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Pure function that renders the rovers' data
const AddRover = (rovers, rover) => {
    const roverObject = rovers.get(rover)
    // If rover's data does not exist, request it
    if (roverObject.size == 0 || typeof roverObject === 'undefined') {
        getRover(store, rover)
        return ``
    } else {
        const latestPhotos = roverObject.get('latest_photos').get(0);
        return `
            <div id="${latestPhotos.get('rover').get('name').toLowerCase()}-box" class="rover-box">
                <h2>${latestPhotos.get('rover').get('name')}</h2>
                <ul class="details-list">
                    <li>Launch Date: ${latestPhotos.get('rover').get('launch_date')}</li>
                    <li>Landing Date: ${latestPhotos.get('rover').get('landing_date')}</li>
                    <li>Status: ${latestPhotos.get('rover').get('status')}</li>
                    <li>Max_sol*: ${latestPhotos.get('sol')}</li>
                    <li>Date the most recent photos were taken: ${latestPhotos.get('earth_date')}</li>
                </ul>
                <p class="note">*Photos are organized by the sol (Martian rotation or day) on
                which they were taken, counting up from the rover's landing date. A photo taken
                on ${latestPhotos.get('rover').get('name')}'s 1000th Martian sol exploring Mars, for
                example, will have a sol attribute of 1000.</p>
                <div>
                    <h2>Latest photos</h2>
                    ${roverObject.get('latest_photos').slice(-4).reduce((acc, curr) => reducePhotos(acc, curr), '')}
                </div>
            </div>
        `
    }
}

// Pure function that renders one button per rover
const AddButtons = (roversList) => {
    return roversList.reduce((acc, curr) => {
      return `
          ${acc}<button id="${curr}-btn" class="rover-btn" onclick="showRover('${curr}')">${curr}</button>
      `
    }, '')
}

// ------------------------------------------------------  PURE FUNCTIONS

const reducePhotos = (acc, curr) => {
    return acc + `<div class="img-box"><img src="${curr.get('img_src')}" width="100%" /></div>`
}

// Show a rover's box and hide the rest of boxes
const showRover = (rover) => {
    store.get('roversList').forEach((r) => {
        if(r == rover) {
            document.getElementById(rover + '-box').style.display = 'block'
        } else {
            document.getElementById(r + '-box').style.display = 'none'
        }
    })
}

// ------------------------------------------------------  API CALLS

const getRover = (state, rover) => {
    fetch(`http://localhost:3000/latest-photos/${rover}`)
        .then(res => res.json())
        .then(data => {
                          const newRovers = {
                              rovers: {}
                          }
                          newRovers.rovers[rover] = data.photos
                          updateStore(newRovers)
                      })
}
