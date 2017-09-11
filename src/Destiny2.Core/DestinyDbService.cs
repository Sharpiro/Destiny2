using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Destiny2.Core
{
    public class DestinyDbService
    {
        private readonly SqlLiteDataLayer _sqlLiteDataLayer;
        private Dictionary<uint, JObject> _itemDatabase;


        public DestinyDbService(SqlLiteDataLayer sqlLiteDataLayer)
        {
            _sqlLiteDataLayer = sqlLiteDataLayer ?? throw new ArgumentNullException(nameof(sqlLiteDataLayer));
        }

        public JObject GetItem(uint hash)
        {
            if (_itemDatabase == null) LoadItemsDatabase();
            //var itemDatabase = LoadItemsDatabase();
            _itemDatabase.TryGetValue(hash, out JObject jObject);
            return jObject;
        }

        //public JObject GetItem(uint hash)
        //{
        //    var query = $@"SELECT * FROM [DestinyInventoryItemDefinition] WHERE json LIKE '%""hash"":2903592984%'";
        //    var results = _sqlLiteDataLayer.ExecuteQuery(query).Select(i =>
        //   {
        //       var blob = i["json"] as byte[];
        //       var json = Encoding.UTF8.GetString(blob);
        //       var jObject = JObject.Parse(json);
        //       //return new { Hash = (uint)jObject["hash"], Data = jObject };
        //       return jObject;
        //   }).ToList();

        //    if (results.Count > 1) throw new InvalidOperationException("");

        //    return results.Single();
        //}

        public IEnumerable<JObject> GetItems(params uint[] itemHashes)
        {
            if (_itemDatabase == null) LoadItemsDatabase();
            if (!itemHashes.Any()) return _itemDatabase.Values;
            var jObjects = itemHashes.Where(_itemDatabase.ContainsKey)
                .Select(k => _itemDatabase[k]);
            return jObjects;
        }

        private void LoadItemsDatabase()
        {
            var query = @"SELECT * FROM [DestinyInventoryItemDefinition]";
            _itemDatabase = _sqlLiteDataLayer.ExecuteQuery(query).Select(i =>
             {
                 var blob = i["json"] as byte[];
                 var json = Encoding.UTF8.GetString(blob);
                 var jObject = JObject.Parse(json);
                 return new { Hash = (uint)jObject["hash"], Data = jObject };
             }).ToDictionary(i => i.Hash, i => i.Data);
        }
    }
}