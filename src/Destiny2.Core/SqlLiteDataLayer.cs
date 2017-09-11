using System;
using System.Collections.Generic;
using System.Data.SQLite;

namespace Destiny2.Core
{
    public class SqlLiteDataLayer
    {
        private readonly string _connectionString;

        public SqlLiteDataLayer(string connectionString)
        {
            _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
        }

        public List<Dictionary<string, object>> ExecuteQuery(string query)
        {
            var list = new List<Dictionary<string, object>>();
            using (var conn = new SQLiteConnection(_connectionString))
            using (var command = conn.CreateCommand())
            {
                conn.Open();
                command.CommandText = query;
                //command.Parameters.Add(new SqliteParameter("", ""));
                using (var reader = command.ExecuteReader())
                {
                    var colNames = new List<string>();
                    for (var i = 0; i < reader.FieldCount; i++)
                    {
                        var colName = reader.GetName(i);
                        colNames.Add(colName);
                    }
                    while (reader.Read())
                    {
                        var dictionary = new Dictionary<string, object>();
                        for (var i = 0; i < reader.FieldCount; i++)
                        {
                            dictionary.Add(colNames[i], reader[i]);
                        }
                        list.Add(dictionary);
                    }
                }
            }
            return list;
        }
    }
}