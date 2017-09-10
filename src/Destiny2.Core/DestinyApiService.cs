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

        public async Task<object> GetManifestAsync()
        {
            const string url = "https://www.bungie.net/Platform/Destiny2/Manifest/";
            var manifest = await _destinyHttpService.GetStringAsync(url);
            return manifest;
        }
    }
}