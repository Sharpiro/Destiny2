using Destiny2.Core;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;

namespace Destiny2.WebServer.Api
{
    public class HomeController
    {
        private readonly DestinyApiService _destinyApiService;
        private readonly DestinyDbService _destinyDbService;

        public HomeController(DestinyApiService destinyApiService, DestinyDbService destinyDbService)
        {
            _destinyApiService = destinyApiService ?? throw new ArgumentNullException(nameof(destinyApiService));
            _destinyDbService = destinyDbService ?? throw new ArgumentNullException(nameof(destinyDbService));
        }

        public JObject GetItem(uint id)
        {
            var item = _destinyDbService.GetItem(id);
            //GC.Collect();
            return item;
        }

        public IEnumerable<JObject> GetItems(params uint[] ids)
        {
            var item = _destinyDbService.GetItems(ids);
            return item;
        }
    }
}