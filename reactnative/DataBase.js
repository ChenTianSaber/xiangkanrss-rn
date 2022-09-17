export const ChannelScheme = {
    name: 'Channel',
    primaryKey: 'xmlLink',
    properties: {
        title: 'string',
        type: 'string',
        xmlLink: 'string',
        htmlLink: 'string',
        description: 'string',
        lastUpdated: 'string',
        fold: 'string',
        icon: 'string'
    }
}

export const RSSItemScheme = {
    name: 'RSSItem',
    primaryKey: 'title',
    properties: {
        title: 'string',
        link: 'string',
        description: 'string',
        content: 'string',
        author: 'string',
        published: 'string',
        channelXmlLink: 'string',
        channelTitle: 'string',
        channelIcon: 'string',
    }
}