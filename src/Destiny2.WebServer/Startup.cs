using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using SharpFileSystem.FileSystems;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net.Http;

namespace Destiny2.WebServer
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            var memoryFileSystem = new MemoryFileSystem();
            var root = SharpFileSystem.FileSystemPath.Root;
            var testFile = root.AppendFile("test.txt");
            var testFileStream = memoryFileSystem.CreateFile(testFile);
            testFileStream.Write(new byte[] { 1, 2, 3 }, 0, 3);
            testFileStream.Flush();
            var path = testFile.Path;
            File.ReadAllBytes("/test.txt");
            //memoryFileSystem.CreateFile(new SharpFileSystem.FileSystemPath());


            //var query = @"SELECT * FROM [DestinyInventoryItemDefinition] WHERE json LIKE '%""hash"":2903592984%'";
            var query = @"SELECT * FROM [DestinyInventoryItemDefinition]";
            var client = new HttpClient(/*new HttpClientHandler() { AutomaticDecompression = DecompressionMethods.GZip }*/);
            var message = new HttpRequestMessage(HttpMethod.Get, "https://www.bungie.net/Platform/Destiny2/Manifest/");
            message.Headers.Add("X-API-Key", "106c3e8ee80248b5bd0514c7f966dc47");
            //var manifest = client.GetAsync("https://www.bungie.net/Platform/Destiny2/Manifest/").Result.Content.ReadAsStringAsync().Result;
            var manifest = client.SendAsync(message).Result.Content.ReadAsStringAsync().Result;

            //message.Headers.Add("Accept-Encoding", "gzip");
            var manifestObject = JObject.Parse(manifest);
            var databasePath = (string)manifestObject.SelectToken("Response.mobileWorldContentPaths.en");
            var fileX = Directory.Exists("unpackZip") ? new DirectoryInfo("unpackZip").GetFiles().FirstOrDefault()?.Name : " ";

            if (!databasePath.EndsWith(fileX))
            {
                var database = client.GetAsync("https://www.bungie.net/common/destiny2_content/sqlite/en/world_sql_content_281de46e3cd73e5747595936fd2dffa9.content").Result.Content.ReadAsByteArrayAsync().Result;
                File.WriteAllBytes("tempdb.sqlite.zip", database);
                ZipFile.ExtractToDirectory("tempdb.sqlite.zip", "unpackZip", overwriteFiles: true);
            }

            var file = Directory.GetFiles("unpackZip").Single();
            var conn = new SqliteConnection($@"Data Source={file}");
            conn.Open();
            var command = conn.CreateCommand();
            command.CommandText = query;
            //command.Parameters.Add(new SqliteParameter("", ""));
            var reader = command.ExecuteReader();
            var itemDictionary = new Dictionary<long, JObject>();
            while (reader.Read())
            {
                var temp1 = reader[0];
                var temp2 = reader[1];
                var json = JObject.Parse(temp2 as string);
                var hash = (long)json["hash"];
                itemDictionary.Add(hash, json);
            }
            conn.Close();
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.Run(async (context) =>
            {
                await context.Response.WriteAsync("Hello World!");
            });
        }

        public static void Main(string[] args)
        {
            var host = new WebHostBuilder()
                .UseKestrel()
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseIISIntegration()
                .UseStartup<Startup>()
                .UseApplicationInsights()
                .Build();

            host.Run();
        }
    }
}
