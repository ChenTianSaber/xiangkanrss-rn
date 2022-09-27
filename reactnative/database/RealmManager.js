import Realm from 'realm'
import { ChannelScheme, RSSItemScheme } from './RealmScheme'

global.realm = new Realm({
    path: "xiangkan",
    schema: [ChannelScheme, RSSItemScheme],
});

/**
 * 查询所有的channels
 */
const queryChannels = () => {
    return global.realm.objects("Channel")
}

/**
 * 查询某个阅读状态的RSSItem
 */
const queryRSSItemByReadState = (readState) => {
    return global.realm.objects("RSSItem").filtered(`readState = ${readState}`)
}

/**
 * 更新channel
 */
const updateChannelLastUpdated = (channel, lastUpdated) => {
    global.realm.write(() => {
        channel.lastUpdated = lastUpdated
    })
}

/**
 * 插入RSSItem
 */
const insertRSSItem = (item) => {
    global.realm.write(() => {
        global.realm.create("RSSItem", item)
    })
}

/**
 * 插入Channel
 */
const insertChannel = (channel) => {
    global.realm.write(() => {
        global.realm.create("Channel", channel)
    })
}

export {
    queryChannels, queryRSSItemByReadState, updateChannelLastUpdated, insertRSSItem, insertChannel
}