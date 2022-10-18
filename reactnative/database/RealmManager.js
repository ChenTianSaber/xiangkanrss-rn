import Realm from 'realm'
import { ChannelScheme, FoldScheme, RSSItemScheme, ScriptScheme } from './RealmScheme'

let realm = new Realm({
    path: "xiangkan",
    schema: [ChannelScheme, RSSItemScheme, FoldScheme, ScriptScheme],
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
 * 通过fold查询channel
 */
const queryChannelByFold = (fold) => {
    return realm.objects("Channel").filtered(`fold = '${fold}'`)
}

/**
 * 通过scriptCode查询channel
 */
const queryChannelByScriptCode = (scriptCode) => {
    return realm.objects("Channel").filtered(`scriptCode = "${scriptCode}"`)
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
const updateChannelInfo = (channel, title, readMode, contentType, fold, scriptCode, scriptTitle) => {
    realm.write(() => {
        channel.title = title
        channel.readMode = readMode
        channel.contentType = contentType
        channel.fold = fold
        channel.scriptCode = scriptCode
        channel.scriptTitle = scriptTitle
    })
}

/**
 * 更新channel的fold
 */
const updateChannelFold = (channel, fold) => {
    realm.write(() => {
        channel.fold = fold
    })
}

/**
 * 更新channel的script
 */
const updateChannelScript = (channel, scriptCode, scriptTitle) => {
    realm.write(() => {
        channel.scriptCode = scriptCode
        channel.scriptTitle = scriptTitle
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

/**
 * 查询所有的folds
 */
const queryFolds = () => {
    return realm.objects("Fold")
}

// 删除Fold
const deleteFold = (fold) => {
    realm.write(() => {
        realm.delete(fold)
    })
}

/**
 * 插入Fold
 */
const insertFold = (fold) => {
    realm.write(() => {
        realm.create("Fold", fold)
    })
}

/**
 * 查询所有的script
 */
const queryScripts = () => {
    return realm.objects("Script")
}

/**
 * 插入Fold
 */
const insertScript = (script) => {
    realm.write(() => {
        realm.create("Script", script)
    })
}

// 删除Script
const deleteScript = (script) => {
    realm.write(() => {
        realm.delete(script)
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
    deleteRSSItems,
    queryFolds,
    insertFold,
    deleteFold,
    queryChannelByFold,
    updateChannelFold,
    queryScripts,
    insertScript,
    queryChannelByScriptCode,
    updateChannelScript,
    deleteScript
}