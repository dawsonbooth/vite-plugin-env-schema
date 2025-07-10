import env from 'virtual:env'

console.log('Validated environment variables:', env)

// Display the environment variables on the page
const envDisplay = document.getElementById('env-display')!
envDisplay.innerHTML = `<pre><code>${JSON.stringify(env, null, 2)}</code></pre>`
