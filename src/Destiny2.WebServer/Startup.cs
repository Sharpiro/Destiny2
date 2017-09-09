using Destiny2.Core;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Reflection;

namespace Destiny2.WebServer
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            var assemblyLocation = Path.GetDirectoryName(Assembly.GetEntryAssembly().Location);
            var destinyDataZipFilePath = $"{assemblyLocation}/destinyData.zip";
            var destinyDataUnpackedDir = $"{assemblyLocation}/destinyDataUnpacked";
            const string apiKey = "106c3e8ee80248b5bd0514c7f966dc47";
            var httpService = new DestinyHttpService(apiKey);

            //var query = @"SELECT * FROM [DestinyInventoryItemDefinition] WHERE json LIKE '%""hash"":2903592984%'";
            var query = @"SELECT * FROM [DestinyInventoryItemDefinition]";
            var manifest = httpService.GetStringAsync("https://www.bungie.net/Platform/Destiny2/Manifest/").Result;

            var manifestObject = JObject.Parse(manifest);
            var databasePath = (string)manifestObject.SelectToken("Response.mobileWorldContentPaths.en");
            var databaseFile = Directory.Exists(destinyDataUnpackedDir) ? new DirectoryInfo(destinyDataUnpackedDir).GetFiles().FirstOrDefault()?.Name : null;

            if (File.Exists(destinyDataZipFilePath)) File.Delete(destinyDataZipFilePath);
            if (databaseFile == null || !databasePath.EndsWith(databaseFile))
            {
                if (Directory.Exists(destinyDataUnpackedDir)) Directory.Delete(destinyDataUnpackedDir);
                var database = httpService.GetBytesAsync("https://www.bungie.net/common/destiny2_content/sqlite/en/world_sql_content_281de46e3cd73e5747595936fd2dffa9.content").Result;
                File.WriteAllBytes(destinyDataZipFilePath, database);
                ZipFile.ExtractToDirectory(destinyDataZipFilePath, destinyDataUnpackedDir, overwriteFiles: true);
                File.Delete(destinyDataZipFilePath);
            }

            databaseFile = Directory.GetFiles(destinyDataUnpackedDir).Single();



            //using (var conn = new SqliteConnection($@"Data Source={databaseFile}"))
            //using (var command = conn.CreateCommand())
            //{
            //    conn.Open();
            //    command.CommandText = query;
            //    //command.Parameters.Add(new SqliteParameter("", ""));
            //    var reader = command.ExecuteReader();
            //    var itemDictionary = new Dictionary<long, JObject>();
            //    while (reader.Read())
            //    {
            //        for (var i = 0; i < reader.FieldCount; i++)
            //        {

            //        }
            //        var temp1 = reader[0];
            //        var temp2 = reader[1];
            //        var json = JObject.Parse(temp2 as string);
            //        var hash = (long)json["hash"];
            //        itemDictionary.Add(hash, json);
            //    }
            //    conn.Close();
            //}
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
