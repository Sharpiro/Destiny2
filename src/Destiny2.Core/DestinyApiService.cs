using Newtonsoft.Json.Linq;
using System;
using System.Threading.Tasks;

namespace Destiny2.Core
{
    public class DestinyApiService
    {
        private readonly DestinyHttpService _destinyHttpService;

        public DestinyApiService(DestinyHttpService destinyHttpService)
        {
            _destinyHttpService = destinyHttpService ?? throw new NotImplementedException(nameof(destinyHttpService));
        }

        public async Task<JObject> GetManifestAsync()
        {
            const string url = "https://www.bungie.net/Platform/Destiny2/Manifest/";
            var data = await _destinyHttpService.GetStringAsync(url);
            var jObject = JObject.Parse(data);
            return jObject;
        }

        public async Task<byte[]> GetWorldContentDatabase()
        {
            const string url = "https://www.bungie.net/common/destiny2_content/sqlite/en/world_sql_content_281de46e3cd73e5747595936fd2dffa9.content";
            var data = await _destinyHttpService.GetBytesAsync(url);
            return data;
        }
    }
}