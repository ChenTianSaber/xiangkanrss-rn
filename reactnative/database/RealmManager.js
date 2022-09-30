import Realm from 'realm'
import { ChannelScheme, FoldScheme, RSSItemScheme } from './RealmScheme'

let realm = new Realm({
    path: "xiangkan",
    schema: [ChannelScheme, RSSItemScheme, FoldScheme],
})

/**
 * 查询所有的channels
 */
const queryChannels = () => {
    return realm.objects("Channel")
}

/**
 * 通过xml查询channel
 */
const queryChannelByXmlLink = (xmlLink) => {
    return realm.objects("Channel").filtered(`xmlLink = '${xmlLink}'`)
}

/**
 * 查询某个阅读状态的RSSItem
 */
const queryRSSItemByReadState = (readState) => {
    return realm.objects("RSSItem").filtered(`readState = ${readState}`)
}

/**
 * 通过xmlLink查询RSSItem
 */
const queryRSSItemByXmlLinkAndReadState = (channelXmlLink, readState) => {
    return realm.objects("RSSItem").filtered(`channelXmlLink = '${channelXmlLink}' and readState = ${readState}`)
}

/**
 * 通过xmlLink查询RSSItem
 */
const queryAllRSSItemByXmlLink = (channelXmlLink) => {
    return realm.objects("RSSItem").filtered(`channelXmlLink = '${channelXmlLink}'`)
}

/**
 * 更新channel
 */
const updateChannelLastUpdated = (channel, lastUpdated) => {
    realm.write(() => {
        channel.lastUpdated = lastUpdated
    })
}

/**
 * 更新channel
 */
const updateChannelInfo = (channel, title, readMode, contentType) => {
    realm.write(() => {
        channel.title = title
        channel.readMode = readMode
        channel.contentType = contentType
    })
}

/**
 * 更新RSSItem
 */
const updateRSSItemReadState = (item, readState) => {
    realm.write(() => {
        item.readState = readState
    })
}

/**
 * 插入RSSItem
 */
const insertRSSItem = (item) => {
    realm.write(() => {
        realm.create("RSSItem", item)
    })
}

/**
 * 插入Channel
 */
const insertChannel = (channel) => {
    realm.write(() => {
        realm.create("Channel", channel)
    })
}

// 删除某个channel
const deleteChannel = (channel) => {
    realm.write(() => {
        realm.delete(channel)
    })
}

// 删除items
const deleteRSSItems = (items) => {
    realm.write(() => {
        realm.delete(items)
    })
}

export {
    queryChannels,
    queryRSSItemByReadState,
    updateChannelLastUpdated,
    insertRSSItem,
    insertChannel,
    updateRSSItemReadState,
    updateChannelInfo,
    queryChannelByXmlLink,
    queryAllRSSItemByXmlLink,
    queryRSSItemByXmlLinkAndReadState,
    deleteChannel,
    deleteRSSItems
}