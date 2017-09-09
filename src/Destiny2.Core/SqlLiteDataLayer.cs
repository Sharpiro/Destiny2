using System;
using System.Collections.Generic;
using Microsoft.Data.Sqlite;

namespace Destiny2.Core
{
    public class SqlLiteDataLayer
    {
        private readonly string _connectionString;

        public SqlLiteDataLayer(string connectionString)
        {
            _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
        }

        public IEnumerable<object> ExecuteQuery(string query)
        {
            using (var conn = new SqliteConnection(_connectionString))
            using (var command = conn.CreateCommand())
            {
                conn.Open();
                command.CommandText = query;
                //command.Parameters.Add(new SqliteParameter("", ""));
                var reader = command.ExecuteReader();
                //var itemDictionary = new Dictionary<long, JObject>();
                while (reader.Read())
                {
                    for (var i = 0; i < reader.FieldCount; i++)
                    {

                    }
                    var temp1 = reader[0];
                    var temp2 = reader[1];
                    //var json = JObject.Parse(temp2 as string);
                    //var hash = (long)json["hash"];
                    //itemDictionary.Add(hash, json);
                }
                conn.Close();
            }


            throw new NotImplementedException();
        }
    }
}