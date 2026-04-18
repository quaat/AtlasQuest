You are a senior product designer, UX expert, front-end architect, and game UI engineer. Design and build a **stunning, production-quality, fully responsive geography learning game** for the browser.

The application is a **continent-based country guessing game**. The user first selects a continent. Then a **beautiful interactive SVG-style map** of that continent is rendered, with **each country shown as an individual clickable/selectable region**. The game randomly chooses a target country from that continent, and the player must identify it by clicking the correct country on the map.

Your goal is to create an experience that feels like a **polished educational game**, not a basic demo. It should be visually impressive, intuitive, rewarding, fast, and motivating enough that users want to keep playing.

---

## Core gameplay

Implement this exact gameplay loop:

1. Show a continent selection screen.
2. After a continent is selected, render that continent’s map with each country as a distinct clickable area.
3. Randomly select one valid country from that continent as the target.
4. Clearly show the name of the target country in a prominent “Find this country” panel.
5. The user clicks countries on the map to guess.
6. If the guess is wrong:

   * the clicked country should visibly turn **red**
   * the guess should be counted
   * the user should continue guessing until correct
   * previously incorrect countries should remain visibly marked unless a new round resets them
7. If the guess is correct:

   * celebrate with a satisfying **fanfare / success animation**
   * show a round summary with:

     * time taken
     * number of tries
     * accuracy or efficiency score
   * allow continuing to the next round
8. Track progress and statistics across sessions using **browser SQLite storage** so users can build long-term progress history.

---

## Product goals

The final result must feel:

* **beautiful**
* **professional**
* **responsive**
* **game-like and engaging**
* **educational**
* **production-ready**
* **smooth and performant**
* **clear and accessible**

This should look like something a real company would ship, with thoughtful visual hierarchy, delightful interactions, and consistent UI polish.

---

## Technical expectations

Build this as a modern browser app with clean architecture and production-minded implementation.

Requirements:

* Responsive layout for desktop, tablet, and mobile
* Crisp scalable map rendering
* Country shapes must support hover, focus, click, touch, and keyboard interaction
* Use a well-structured component architecture
* Keep state management clean and predictable
* Persist data locally using **browser SQLite**
* Include robust fallback handling for unsupported features
* Use performant rendering and avoid janky map interactions
* Ensure accessibility best practices:

  * keyboard navigation
  * visible focus states
  * readable contrast
  * ARIA labels where appropriate
  * non-color cues in addition to red/green states

---

## Visual and UX direction

Create a **premium game-like interface** with the following qualities:

* Modern, elegant layout
* Beautiful typography
* Rich but restrained color palette
* Soft depth, subtle gradients, glass or card effects where appropriate
* Smooth microinteractions
* Tasteful animation
* Strong onboarding clarity
* Highly legible game HUD
* Confident professional styling, not childish or cluttered

The experience should blend:

* polished educational software
* modern strategy game UI
* premium interactive data visualization

Use a refined visual system with:

* clear spacing scale
* consistent component language
* hover/press/selected/success/error states
* animated transitions between menu, gameplay, and results
* celebratory success feedback that feels rewarding but not excessive

---

## Map interaction requirements

The continent map is the centerpiece of the experience.

Implement the map so that:

* each country is an individual interactive region
* hover shows subtle highlight
* selected wrong countries stay marked in red
* correct answer state is visually distinct and celebratory
* map scales nicely across viewport sizes
* small countries remain usable:

  * add zoom support, insets, hit-area expansion, or alternate selection list if needed
* country labels can appear contextually where useful without cluttering the map
* touch interactions are reliable on smaller screens

Where geography complexity makes direct clicking difficult, provide tasteful usability solutions such as:

* zoom/pan
* magnifier interaction
* searchable country list
* mini overlays for tiny states/islands
* “highlight on hover in list and map” cross-linking

Do not let usability break for Europe, the Caribbean, small African states, Southeast Asia islands, or other dense regions.

---

## Scoring and persistence

Use browser SQLite to persist meaningful stats and game history.

Store and surface things like:

* rounds played
* correct answers
* average tries per round
* average response time
* best times by continent
* streaks
* mastery by continent
* country-specific performance history
* countries most often missed
* recently practiced countries
* total play time

Create a schema that supports future extension.

Include a polished statistics/progress experience, such as:

* profile dashboard
* continent mastery cards
* best score summaries
* streak indicators
* performance charts or sparklines
* difficult countries heatmap/list
* recent sessions history

Data should feel useful and motivating, not just stored.

---

## Suggested game features to add

Add thoughtful features that improve engagement and learning quality. Include the best ideas below in a cohesive way:

### Game modes

Include multiple modes, such as:

* **Classic Mode**: one target country at a time
* **Timed Challenge**: as many countries as possible within a time limit
* **Streak Mode**: lose streak on too many mistakes
* **Practice Mode**: relaxed mode with hints and no pressure
* **Mastery Review**: prioritize countries the player often misses

### Difficulty and learning support

Add features like:

* difficulty settings
* optional hints
* progressive reveal hints
* region highlighting hints
* fact cards after correct answers
* pronunciation button for country names
* capital/currency/population/fun fact reveal after round completion
* spaced repetition logic for weak countries

### Reward systems

Add tasteful gamification:

* XP or mastery points
* achievement badges
* streak rewards
* continent completion medals
* daily challenge
* personal best celebrations
* progress rings or mastery bars

### UX enhancements

Add:

* subtle sound effects with mute control
* success fanfare
* haptic-friendly mobile interactions where appropriate
* theme toggle
* onboarding/tutorial
* smooth state transitions
* loading skeletons/placeholders
* settings panel
* pause/resume for timed modes

### Educational enhancements

Add:

* short country facts after each correct answer
* optional capitals quiz follow-up
* “show me where it is” learning step after wrong attempts
* review queue of missed countries
* end-of-session insights like:

  * “You struggle most with West Africa”
  * “You improved your Europe average by 24%”

---

## Information architecture

Design the app with a complete product structure, including screens/views such as:

* Landing / home screen
* Continent selection
* Game screen
* Round results modal or panel
* Progress/statistics dashboard
* Session summary screen
* Settings
* Optional onboarding/tutorial
* Optional achievements screen

---

## Output requirements

Produce a complete implementation plan and product-ready build specification.

Your output should include:

1. **Product overview**
2. **Core user flows**
3. **Feature list**
4. **UI/UX design system direction**
5. **Screen-by-screen breakdown**
6. **Component architecture**
7. **State model**
8. **SQLite storage design**
9. **Scoring system design**
10. **Game modes design**
11. **Accessibility considerations**
12. **Responsive behavior**
13. **Animation and sound design guidance**
14. **Edge cases and usability solutions for small countries**
15. **Future expansion ideas**
16. **Production-quality implementation**

---

## Implementation quality bar

The solution must be:

* cleanly architected
* realistic to implement
* not a prototype-only sketch
* consistent across all screens
* visually compelling
* educationally effective
* polished in interactions and copy
* suitable as a portfolio-quality or commercial-quality web app

Avoid generic filler. Make specific, strong design and implementation decisions.

---

## Preferred implementation approach

Unless there is a compelling reason otherwise, implement this as:

* a modern front-end web app
* component-driven architecture
* interactive SVG or vector-map based rendering
* browser SQLite-backed persistence
* local-first behavior
* polished responsive UI
* maintainable and scalable codebase

Include concrete recommendations for:

* frameworks/libraries
* map data handling strategy
* performance strategy
* local database access pattern
* testing approach
* extensibility

---

## Tone of the output

Be decisive, expert-level, and detailed. Think like a top-tier product/design/engineering team creating a **world-class geography learning game**.

Do not produce a shallow summary. Produce a **rich, high-quality, implementation-ready specification** with strong creative direction and smart product decisions.

---

## Extra quality touches to incorporate

Make the experience feel exceptional with details such as:

* animated continent cards on selection
* dynamic background visuals inspired by global travel/cartography
* elegant scoreboard transitions
* end-of-round confetti or glow burst
* country discovery cards
* mastery map overlays
* daily challenge banner
* personalized progress insights
* “Play again” loops that feel fast and satisfying
* empty states that encourage progress
* polished mobile layout where the map remains central and usable

Whenever there is a tradeoff, prioritize:

1. usability
2. beauty
3. learning effectiveness
4. responsiveness
5. maintainability

Build something that users would genuinely love using.

