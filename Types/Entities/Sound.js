function Sound(spec) {
  const {
    self,
    assets,
  } = Entity(spec, 'Sound')

  const {
    asset,
    domain = null,
    walkers = null,
    loop = false,
    duration = null,
    fadeOut = 300,
    volume = 1,
  }  = spec

  const howl = _.get(assets, asset)

  let secondsPlayed = 0
  let played = false

  function awake() {
    if (!domain) {
      howl.play()
      played = true
      console.log('PLAYING')
    }

    howl.volume(volume)
    howl.loop(loop)
  }

  function tick() {
    if (domain) {
      if (!walkers)
        throw `walkers cannot be null if walkerRange is passed`

      const x = walkers[0].transform.position.x

      // Sounds w/ domains only play once
      if (x > domain[0] && !howl.playing() && !played) {
        played = true
        howl.play()
      }

      if (domain.length != 2 && domain.length != 4)
        throw `Expected domain in Sound to have 2 (fade in range) or 4 (+ fade out range) elements, got ${domain.length}`

      let volume = math.clamp01(math.unlerp(domain[0], domain[1], x))

      if (domain.length == 4)
        volume *= math.clamp01(math.unlerp(domain[3], domain[2], x))

      howl.volume(volume)
    }

    if (duration) {
      const a = 1 - math.clamp01(math.unlerp(duration - fadeOut, duration, secondsPlayed * 1000))
      howl.volume(howl.volume() * a)
    }

    if (howl.playing())
      secondsPlayed += 1 / ticksPerSecond
  }

  function onTransitionMap(navigating) {
    if (navigating)
      howl.pause()
    else
      howl.play()
  }

  function destroy() {
    howl.stop()
  }

  return self.mix({
    awake,
    tick,
    destroy,
    onTransitionMap,
  })
}