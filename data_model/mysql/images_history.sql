CREATE TABLE `images_history` (
  `id`             int(10) unsigned     NOT NULL AUTO_INCREMENT,
  `path`           varchar(1024)        NOT NULL DEFAULT '',
  `filename`       varchar(1024)        NOT NULL DEFAULT '',
  `md5_path`       varchar(32)          NOT NULL DEFAULT '',
  `md5_binary`     varchar(32)          NOT NULL DEFAULT '',
  `version`        char(1)              NOT NULL DEFAULT '',
  `size`           int(10) unsigned     NOT NULL,
  `width`          int(10) unsigned     NOT NULL,
  `height`         int(10) unsigned     NOT NULL,
  `extension`      varchar(10)          NOT NULL DEFAULT '',
  `live`           tinyint(10) unsigned NOT NULL,
  `suggested`      tinyint(10) unsigned NOT NULL,
  `master_file_id` int(10) unsigned              DEFAULT NULL,
  `created_at`     datetime             NOT NULL,
  `updated_at`     datetime             NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `md5_path__md5_binary` (`md5_path`, `md5_binary`),
  KEY `path` (`path`),
  KEY `md5_path` (`md5_path`),
  KEY `md5_binary` (`md5_binary`),
  KEY `version` (`version`),
  KEY `extension` (`extension`),
  KEY `live` (`live`),
  KEY `suggested` (`suggested`),
  KEY `master_file_id` (`master_file_id`),
  KEY `created_at` (`created_at`),
  KEY `updated_at` (`updated_at`)
)
  ENGINE = InnoDB
  AUTO_INCREMENT = 21
  DEFAULT CHARSET = utf8;