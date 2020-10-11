const foo = 'bar'

console.log(foo)

const bar = new Set()
bar.add('foo')

console.log(bar)

document.querySelector('body').classList.add(foo)
document.querySelector('body').innerHTML = `Bar size: ${bar.size}`
