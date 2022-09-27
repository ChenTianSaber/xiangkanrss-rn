import Realm from 'realm'
import { ChannelScheme, RSSItemScheme } from './RealmScheme'

let realm = new Realm({
    path: "xiangkan",
    schema: [ChannelScheme, RSSItemScheme],
})

/**
 * 查询所有的channels
 */
const queryChannels = () => {
    return realm.objects("Channel")
}

/**
 * 查询某个阅读状态的RSSItem
 */
const queryRSSItemByReadState = (readState) => {
    return realm.objects("RSSItem").filtered(`readState = ${readState}`)
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

export {
    queryChannels, queryRSSItemByReadState, updateChannelLastUpdated, insertRSSItem, insertChannel
}