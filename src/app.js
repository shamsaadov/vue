import Vue from 'vue'
import VueApollo from 'vue-apollo'

Vue.use(VueApollo)

const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
})

new Vue({
    el: '#app',
    apolloProvider,
})
