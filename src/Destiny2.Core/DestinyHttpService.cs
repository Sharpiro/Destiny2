using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace Destiny2.Core
{
    public class DestinyHttpService
    {
        private readonly string _apiKey;

        public DestinyHttpService(string apiKey)
        {
            _apiKey = apiKey ?? throw new ArgumentNullException(nameof(apiKey));
        }

        public async Task<string> GetStringAsync(string url)
        {
            using (var handler = new HttpClientHandler { AutomaticDecompression = DecompressionMethods.GZip })
            using (var client = new HttpClient(handler))
            using (var message = CreateRequestWithHeaders(url))
            {
                var responseMessage = await client.SendAsync(message);
                var content = await responseMessage.Content.ReadAsStringAsync();
                return content;
            }
        }

        public async Task<byte[]> GetBytesAsync(string url)
        {
            using (var handler = new HttpClientHandler { AutomaticDecompression = DecompressionMethods.GZip })
            using (var client = new HttpClient(handler))
            using (var message = CreateRequestWithHeaders(url))
            {
                var responseMessage = await client.SendAsync(message);
                var content = await responseMessage.Content.ReadAsByteArrayAsync();
                return content;
            }
        }

        private HttpRequestMessage CreateRequestWithHeaders(string url)
        {
            var message = new HttpRequestMessage(HttpMethod.Get, url);
            message.Headers.Add("X-API-Key", _apiKey);
            message.Headers.Add("Accept-Encoding", "gzip");
            return message;
        }
    }
}