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
        readMode: 'int', // 0：RSS内容，1：网页模式
        contentType: 'int', // 0: 文章 1：视频 2：图集
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
        readState: 'int',
        cover: 'string',
        channelXmlLink: 'string',
        channelTitle: 'string',
        channelIcon: 'string',
    }
}