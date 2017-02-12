if (window.console) { console.log('[sandbox]', 'setup template db'); }
var templates = [];

// Set up message event handler:
window.addEventListener('message', function(event) {
    var command = event.data.command;
    var name = event.data.name || 'hello';
    switch(command) {
    case 'render':
        if (window.console) { console.log('[sandbox]', 'render template', event.data.name); }
        event.source.postMessage({
            name: name,
            command: 'render',
            html: templates[name](event.data.context)
        }, event.origin);
        break;
        // You could imagine additional functionality. For instance:
    case 'new':
        if (window.console) { console.log('[sandbox]', 'compile template', event.data.name); }

        templates[event.data.name] = Handlebars.compile(event.data.source);
        event.source.postMessage({name: name, command: 'new',success: true}, event.origin);
        break;
    }
});

